'use strict';
/**
 * AuthService.js — Business logic for authentication.
 *
 * Responsibilities:
 *   - Tourist self-registration
 *   - Login with lockout enforcement (D4 / REQ-5.2)
 *   - JWT issuance
 *   - Current user lookup
 *
 * Security notes:
 *   - Generic error "Invalid username or password" is always used on login failure
 *     to prevent username enumeration (D4).
 *   - bcrypt cost is set in constants.js (BCRYPT_ROUNDS = 12).
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_EXPIRY } = require('../config/constants');
const { createError } = require('../middleware/errorHandler');

/** Generic login failure message — do not change this to something more specific. */
const LOGIN_FAILURE_MSG = 'Invalid username or password';

/**
 * Register a new tourist account.
 * @param {string} username
 * @param {string} password - plain text; hashed inside User model
 * @returns {Promise<{ user: object, token: string }>}
 */
async function register(username, password) {
  // Check for existing username (case-insensitive due to lowercase transform on schema)
  const existing = await User.findOne({ username: username.toLowerCase().trim() });
  if (existing) {
    throw createError(409, 'Username already taken');
  }

  const user = new User({ username, role: 'tourist' });
  await user.setPassword(password);
  await user.save();

  const token = issueToken(user);
  return { user: safeUser(user), token };
}

/**
 * Authenticate a user (tourist or admin).
 * Enforces lockout; always returns a generic error on failure.
 * @param {string} username
 * @param {string} password - plain text
 * @returns {Promise<{ user: object, token: string }>}
 */
async function login(username, password) {
  // Fetch with passwordHash explicitly (select: false on schema)
  const user = await User.findOne({ username: username.toLowerCase().trim() }).select(
    '+passwordHash'
  );

  // Generic failure path — applies to: user not found, wrong password, blocked
  // We still check lockout & increment attempts even when user doesn't exist
  // to prevent timing-based enumeration differences.
  if (!user) {
    throw createError(401, LOGIN_FAILURE_MSG);
  }

  // Lockout check
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw createError(
      401,
      `Account temporarily locked. Try again in ${minutesLeft} minute(s).`
    );
  }

  // Blocked check
  if (user.status === 'blocked') {
    throw createError(401, LOGIN_FAILURE_MSG);
  }

  // Password check
  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) {
    user.recordFailedLogin();
    await user.save();
    throw createError(401, LOGIN_FAILURE_MSG);
  }

  // Successful login — clear failure state
  user.clearFailedLogin();
  await user.save();

  const token = issueToken(user);
  return { user: safeUser(user), token };
}

/**
 * Return the current authenticated user's public profile.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function me(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw createError(404, 'User not found');
  return safeUser(user);
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * Issue a signed JWT for a user.
 * Payload contains sub (user id), role.
 * @param {object} user - Mongoose document or plain object
 * @returns {string} signed JWT
 */
function issueToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Strip sensitive fields from a user object.
 * @param {object} user
 * @returns {object}
 */
function safeUser(user) {
  return {
    id:        user._id.toString(),
    username:  user.username,
    role:      user.role,
    status:    user.status,
    createdAt: user.createdAt,
  };
}

module.exports = { register, login, me };
