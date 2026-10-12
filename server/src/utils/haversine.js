'use strict';
/**
 * haversine.js — Geographic distance utilities.
 *
 * Used by:
 *   - PlanGeneratorService (travel time between stops)
 *   - Seed script and AdminService (auto-estimate distanceKm)
 */
const { EARTH_RADIUS_KM, ROAD_FACTOR, AVG_SPEED_KMH, TRAVEL_ROUND_MINUTES } = require('../config/constants');

/**
 * Calculate the great-circle (straight-line) distance between two points using the
 * Haversine formula.
 *
 * @param {{ lat: number, lng: number }} a - First coordinate
 * @param {{ lat: number, lng: number }} b - Second coordinate
 * @returns {number} Distance in kilometres
 */
function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Estimate road distance from haversine distance.
 * Uses ROAD_FACTOR constant (1.4 — accounts for road winding).
 *
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number} Estimated road distance in kilometres
 */
function estimatedRoadKm(a, b) {
  return haversineKm(a, b) * ROAD_FACTOR;
}

/**
 * Calculate travel time between two points in minutes.
 * Uses the road distance estimate divided by average speed,
 * then rounds UP to the nearest TRAVEL_ROUND_MINUTES.
 *
 * Formula: ceil(haversine × ROAD_FACTOR / AVG_SPEED_KMH × 60 / TRAVEL_ROUND_MINUTES) × TRAVEL_ROUND_MINUTES
 *
 * @param {{ lat: number, lng: number }} a - Start coordinate
 * @param {{ lat: number, lng: number }} b - End coordinate
 * @returns {number} Travel time in minutes (rounded up to nearest 5 min)
 */
function travelMinutes(a, b) {
  const roadKm = haversineKm(a, b) * ROAD_FACTOR;
  const rawMinutes = (roadKm / AVG_SPEED_KMH) * 60;
  return Math.ceil(rawMinutes / TRAVEL_ROUND_MINUTES) * TRAVEL_ROUND_MINUTES;
}

/**
 * Extract lat/lng from a GeoJSON Point coordinates array.
 * Mongoose stores as [lng, lat] (GeoJSON standard).
 *
 * @param {[number, number]} coordinates - [longitude, latitude]
 * @returns {{ lat: number, lng: number }}
 */
function coordsFromGeoJSON(coordinates) {
  return { lng: coordinates[0], lat: coordinates[1] };
}

module.exports = { haversineKm, estimatedRoadKm, travelMinutes, coordsFromGeoJSON };
