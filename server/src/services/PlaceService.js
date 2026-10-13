'use strict';
/**
 * PlaceService.js — Business logic for places (browse, search, filter).
 */
const Place    = require('../models/Place');
const Category = require('../models/Category');
const { createError } = require('../middleware/errorHandler');

/**
 * List active places, with optional filtering by category slug(s) and text query.
 * @param {{ category?: string, q?: string }} opts
 * @returns {Promise<object[]>}
 */
async function listPlaces({ category, q } = {}) {
  const filter = { isActive: true };

  if (category) {
    // Accepts comma-separated category slugs
    const slugs = category.split(',').map((s) => s.trim()).filter(Boolean);
    const cats  = await Category.find({ slug: { $in: slugs } }).select('_id');
    if (cats.length === 0) return [];
    filter.categories = { $in: cats.map((c) => c._id) };
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const places = await Place.find(filter)
    .populate('categories', 'name slug icon')
    .select('-__v')
    .lean();

  return places.map(sanitisePlace);
}

/**
 * Get a single active place by slug or Mongo ID.
 * @param {string} slugOrId
 * @returns {Promise<object>}
 */
async function getPlace(slugOrId) {
  let place;
  if (slugOrId.match(/^[a-f\d]{24}$/i)) {
    place = await Place.findOne({ _id: slugOrId, isActive: true })
      .populate('categories', 'name slug icon')
      .select('-__v')
      .lean();
  } else {
    place = await Place.findOne({ slug: slugOrId, isActive: true })
      .populate('categories', 'name slug icon')
      .select('-__v')
      .lean();
  }

  if (!place) throw createError(404, 'Place not found');
  return sanitisePlace(place);
}

/* ─── Admin-facing service methods ────────────────────────────── */

/**
 * List ALL places (admin) including inactive ones.
 */
async function adminListPlaces() {
  const places = await Place.find()
    .populate('categories', 'name slug icon')
    .select('-__v')
    .lean();
  return places.map(sanitisePlace);
}

/**
 * Create a new place (admin).
 * @param {object} data
 * @returns {Promise<object>}
 */
async function createPlace(data) {
  const place = new Place(data);
  await place.save();
  await place.populate('categories', 'name slug icon');
  return sanitisePlace(place.toObject());
}

/**
 * Update a place by ID (admin).
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
async function updatePlace(id, updates) {
  const place = await Place.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('categories', 'name slug icon');

  if (!place) throw createError(404, 'Place not found');
  return sanitisePlace(place.toObject());
}

/**
 * Delete a place by ID (admin) — hard delete.
 * @param {string} id
 */
async function deletePlace(id) {
  const place = await Place.findByIdAndDelete(id);
  if (!place) throw createError(404, 'Place not found');
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function sanitisePlace(p) {
  const { __v, ...rest } = p;
  return rest;
}

module.exports = { listPlaces, getPlace, adminListPlaces, createPlace, updatePlace, deletePlace };
