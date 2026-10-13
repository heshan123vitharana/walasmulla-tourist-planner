'use strict';
/**
 * PlanService.js — Itinerary generation & saved-plan CRUD (M4).
 *
 * Generate algorithm:
 *   - auto mode: nearest-neighbour greedy ordering (simple TSP heuristic)
 *   - manual mode: respect the caller-supplied order array
 *   - For each stop compute: arrival = previous finish + travel time
 *   - ETAs are NEVER persisted; always computed at read time.
 */
const VisitPlan = require('../models/VisitPlan');
const Place     = require('../models/Place');
const { createError } = require('../middleware/errorHandler');
const {
  travelMinutes,
  coordsFromGeoJSON,
} = require('../utils/haversine');
const {
  WALASMULLA_CENTRE,
  DAY_START_DEFAULT,
  DAY_END_WARNING,
} = require('../config/constants');

/* ─── Itinerary engine ────────────────────────────────────────── */

/**
 * Generate an itinerary from a list of place IDs.
 * Does NOT require authentication — can be called by guests.
 *
 * @param {{
 *   placeIds:    string[],
 *   startTime?:  string,      // "HH:mm"
 *   orderMode?:  'auto'|'manual',
 *   manualOrder?: string[],   // place IDs in desired order
 * }} opts
 * @returns {Promise<{ stops: object[], warnings: string[] }>}
 */
async function generatePlan({ placeIds, startTime, orderMode, manualOrder } = {}) {
  if (!placeIds || placeIds.length === 0) {
    throw createError(400, 'placeIds must be a non-empty array');
  }
  if (placeIds.length > 20) {
    throw createError(400, 'A plan can have at most 20 stops');
  }

  const places = await Place.find({
    _id: { $in: placeIds },
    isActive: true,
  }).populate('categories', 'name slug icon').lean();

  if (places.length === 0) throw createError(404, 'No valid places found');

  // Build a lookup map
  const placeMap = Object.fromEntries(places.map((p) => [p._id.toString(), p]));

  // Determine ordering
  let ordered;
  if (orderMode === 'manual' && Array.isArray(manualOrder) && manualOrder.length > 0) {
    ordered = manualOrder.map((id) => placeMap[id]).filter(Boolean);
  } else {
    ordered = nearestNeighbour(places, WALASMULLA_CENTRE);
  }

  // Compute ETAs
  const start   = parseHHmm(startTime || DAY_START_DEFAULT);
  const dayEnd  = parseHHmm(DAY_END_WARNING);
  const stops   = [];
  const warnings = [];
  let current   = start;
  let prevCoord = WALASMULLA_CENTRE;

  for (const place of ordered) {
    const coord     = coordsFromGeoJSON(place.location.coordinates);
    const travel    = travelMinutes(prevCoord, coord);
    const arrival   = addMinutes(current, travel);
    const visitMins = place.visitDurationMinutes;
    const departure = addMinutes(arrival, visitMins);

    stops.push({
      place:          sanitisePlace(place),
      travelMinutes:  travel,
      arrivalTime:    formatHHmm(arrival),
      visitMinutes:   visitMins,
      departureTime:  formatHHmm(departure),
    });

    if (departure > dayEnd) {
      warnings.push(`You may not finish at ${place.name} before ${DAY_END_WARNING}. Consider starting earlier or removing some stops.`);
    }

    current   = departure;
    prevCoord = coord;
  }

  return { stops, warnings };
}

/* ─── Saved plan CRUD ─────────────────────────────────────────── */

async function listPlans(userId) {
  const plans = await VisitPlan.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'stops.place', select: 'name slug imageUrl location visitDurationMinutes' })
    .lean();
  return plans;
}

async function createSavedPlan(userId, { title, placeIds, startTime, orderMode }) {
  if (!placeIds || placeIds.length === 0) throw createError(400, 'placeIds required');

  // Generate the ordered stops
  const { stops } = await generatePlan({ placeIds, startTime, orderMode });

  const stopDocs = stops.map((s, i) => ({
    place: s.place._id,
    order: i,
  }));

  const plan = new VisitPlan({
    user:      userId,
    title:     title || `My Plan ${new Date().toLocaleDateString()}`,
    startTime: startTime || DAY_START_DEFAULT,
    orderMode: orderMode || 'auto',
    stops:     stopDocs,
  });

  await plan.save();
  return plan.toObject();
}

async function getPlan(userId, planId) {
  const plan = await VisitPlan.findOne({ _id: planId, user: userId })
    .populate({ path: 'stops.place', select: 'name slug imageUrl location visitDurationMinutes categories', populate: { path: 'categories', select: 'name slug icon' } })
    .lean();

  if (!plan) throw createError(404, 'Plan not found');

  // Recompute ETAs
  const { stops, warnings } = await generatePlan({
    placeIds:  plan.stops.map((s) => s.place._id.toString()),
    startTime: plan.startTime,
    orderMode: plan.orderMode,
    manualOrder: plan.orderMode === 'manual' ? plan.stops.sort((a, b) => a.order - b.order).map((s) => s.place._id.toString()) : undefined,
  });

  return { ...plan, computedStops: stops, warnings };
}

async function updatePlan(userId, planId, updates) {
  const plan = await VisitPlan.findOneAndUpdate(
    { _id: planId, user: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!plan) throw createError(404, 'Plan not found');
  return plan.toObject();
}

async function deletePlan(userId, planId) {
  const plan = await VisitPlan.findOneAndDelete({ _id: planId, user: userId });
  if (!plan) throw createError(404, 'Plan not found');
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * Nearest-neighbour greedy ordering starting from a given coord.
 * @param {object[]} places - Mongoose Place lean objects
 * @param {{ lat: number, lng: number }} start
 * @returns {object[]}
 */
function nearestNeighbour(places, start) {
  const remaining = [...places];
  const ordered   = [];
  let   current   = start;

  while (remaining.length > 0) {
    let minDist = Infinity;
    let nearest = 0;

    remaining.forEach((p, i) => {
      const coord = coordsFromGeoJSON(p.location.coordinates);
      const { haversineKm } = require('../utils/haversine');
      const d = haversineKm(current, coord);
      if (d < minDist) { minDist = d; nearest = i; }
    });

    const next = remaining.splice(nearest, 1)[0];
    ordered.push(next);
    current = coordsFromGeoJSON(next.location.coordinates);
  }

  return ordered;
}

/** "HH:mm" → minutes since midnight */
function parseHHmm(str) {
  const [h, m] = (str || '08:00').split(':').map(Number);
  return h * 60 + m;
}

/** Minutes since midnight → "HH:mm" */
function formatHHmm(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Add minutes to a time value (minutes since midnight) */
function addMinutes(base, delta) {
  return base + delta;
}

function sanitisePlace(p) {
  const { __v, ...rest } = p;
  return rest;
}

module.exports = { generatePlan, listPlans, createSavedPlan, getPlan, updatePlan, deletePlan };
