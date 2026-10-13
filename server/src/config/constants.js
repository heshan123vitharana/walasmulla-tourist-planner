'use strict';
/**
 * constants.js — Single source of truth for all algorithm and security constants.
 * All itinerary calculation parameters are defined here.
 * Update this file to change system-wide behaviour; do not hard-code elsewhere.
 */

/** Walasmulla town centre (Clock Tower Junction B410). */
const WALASMULLA_CENTRE = Object.freeze({ lat: 6.1528, lng: 80.6981 });

/** Road-distance factor: haversine × ROAD_FACTOR ≈ road distance. */
const ROAD_FACTOR = 1.4;

/** Average travel speed between tourist stops (km/h). */
const AVG_SPEED_KMH = 40;

/**
 * Travel time is rounded UP to the nearest multiple of this many minutes.
 * E.g. 7 min → 10 min if TRAVEL_ROUND_MINUTES = 5.
 */
const TRAVEL_ROUND_MINUTES = 5;

/** Default day start time (24-h "HH:mm"). */
const DAY_START_DEFAULT = '08:00';

/**
 * End-of-day warning threshold.
 * A warning is emitted (REQ-3.3) if the last stop's finish time exceeds this.
 */
const DAY_END_WARNING = '18:00';

/** bcrypt work factor (cost). NIST SP 800-132 recommends ≥ 10; we use 12. */
const BCRYPT_ROUNDS = 12;

/** JWT expiry as a string accepted by jsonwebtoken. */
const JWT_EXPIRY = '1h';

/** Maximum consecutive failed login attempts before lockout. (REQ-5.2 / D4) */
const LOGIN_MAX_ATTEMPTS = 5;

/** Duration of account lockout in minutes. (REQ-5.2 / D4) */
const LOGIN_LOCKOUT_MINUTES = 15;

/**
 * Haversine distance multiplier used to AUTO-ESTIMATE distanceKm for
 * admin-created places that do not supply an explicit road distance. (D7)
 */
const HAVERSINE_TO_ROAD_ESTIMATE = 1.3;

/** Earth radius in kilometres — used by the haversine utility. */
const EARTH_RADIUS_KM = 6371;

module.exports = {
  WALASMULLA_CENTRE,
  ROAD_FACTOR,
  AVG_SPEED_KMH,
  TRAVEL_ROUND_MINUTES,
  DAY_START_DEFAULT,
  DAY_END_WARNING,
  BCRYPT_ROUNDS,
  JWT_EXPIRY,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCKOUT_MINUTES,
  HAVERSINE_TO_ROAD_ESTIMATE,
  EARTH_RADIUS_KM,
};
