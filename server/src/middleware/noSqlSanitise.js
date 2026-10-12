'use strict';
/**
 * noSqlSanitise.js — Middleware to prevent NoSQL injection attacks.
 *
 * Strips any object key that:
 *   - Starts with "$" (MongoDB operator prefix), OR
 *   - Contains "." (dot notation used to reference nested fields / prototype keys)
 *
 * Applied recursively to req.body, req.query, and req.params.
 */

/**
 * Recursively sanitise an object by removing dangerous keys.
 * @param {*} obj - The value to sanitise (any type).
 * @returns {*} - The sanitised value.
 */
function sanitise(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitise);
  }

  if (typeof obj === 'object') {
    const clean = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        // Drop the key silently — log at debug level in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[noSqlSanitise] Dropped dangerous key: "${key}"`);
        }
        continue;
      }
      clean[key] = sanitise(obj[key]);
    }
    return clean;
  }

  return obj;
}

/**
 * Express middleware that sanitises req.body, req.query, and req.params.
 */
function noSqlSanitise(req, _res, next) {
  req.body   = sanitise(req.body)   || {};
  req.query  = sanitise(req.query)  || {};
  req.params = sanitise(req.params) || {};
  next();
}

module.exports = { noSqlSanitise, sanitise };
