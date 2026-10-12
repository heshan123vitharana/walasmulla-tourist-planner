'use strict';
/**
 * authenticate.js — JWT bearer token middleware.
 *
 * Verifies the Authorization: Bearer <token> header.
 * Re-fetches the user from the DB on every request to enforce:
 *   - Blocked status (D5: "existing tokens are rejected")
 *   - Role integrity (in case it changes)
 *
 * Sets req.user = { id, username, role, status } on success.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('./errorHandler');

/**
 * Middleware: require a valid, unexpired JWT.
 * On failure: 401 Unauthorized.
 * On blocked user: 403 Forbidden.
 */
async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'Authentication required'));
    }

    const token = authHeader.slice(7); // strip "Bearer "
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch user to check current status (blocked users must be rejected even with a valid token)
    const user = await User.findById(decoded.sub).lean();
    if (!user) {
      return next(createError(401, 'User no longer exists'));
    }
    if (user.status === 'blocked') {
      return next(createError(403, 'Account is blocked'));
    }

    // Attach a minimal safe user object — never attach passwordHash
    req.user = {
      id:       user._id.toString(),
      username: user.username,
      role:     user.role,
      status:   user.status,
    };

    next();
  } catch (err) {
    // Let the global error handler map JWT errors to 401
    next(err);
  }
}

/**
 * Optional authentication — sets req.user if token present and valid,
 * but does not fail if no token is provided. Used for stateless plan generation.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // anonymous — that's fine
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };
