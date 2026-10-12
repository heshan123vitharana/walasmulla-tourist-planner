'use strict';
/**
 * requireRole.js — Role-based access control middleware factory.
 *
 * Usage:
 *   router.get('/admin/places', authenticate, requireRole('admin'), controller);
 *   router.get('/plans',        authenticate, requireRole('tourist', 'admin'), controller);
 */
const { createError } = require('./errorHandler');

/**
 * Factory that returns middleware requiring one of the specified roles.
 * Must be used AFTER the `authenticate` middleware (which sets req.user).
 *
 * @param {...string} roles - Allowed role(s) e.g. 'admin', 'tourist'
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Insufficient permissions'));
    }
    next();
  };
}

module.exports = { requireRole };
