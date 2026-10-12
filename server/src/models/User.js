'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, LOGIN_LOCKOUT_MINUTES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, digits and underscores'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in query results unless explicitly requested
    },
    role: {
      type: String,
      enum: ['tourist', 'admin'],
      default: 'tourist',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ─── Indexes ──────────────────────────────────────────────────── */
userSchema.index({ username: 1 }); // already unique; explicit index for clarity

/* ─── Virtual: isLocked ────────────────────────────────────────── */
userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

/* ─── Instance Methods ─────────────────────────────────────────── */

/**
 * Hash a plain-text password and store it.
 * @param {string} plainPassword
 */
userSchema.methods.setPassword = async function (plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
};

/**
 * Compare a plain-text password against the stored hash.
 * @param {string} plainPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Record a failed login attempt, locking the account after LOGIN_MAX_ATTEMPTS.
 * Returns the updated document (not saved — caller must save).
 */
userSchema.methods.recordFailedLogin = function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= require('../config/constants').LOGIN_MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
    this.failedLoginAttempts = 0; // reset counter after locking
  }
};

/**
 * Clear failed-login state after a successful login.
 */
userSchema.methods.clearFailedLogin = function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
};

/* ─── Pre-save Hook ────────────────────────────────────────────── */
// Note: password hashing is done explicitly via setPassword(); this hook
// guards against accidentally saving a plain-text passwordHash.
userSchema.pre('save', function (next) {
  // Ensure passwordHash is never a plain-text value (bcrypt hashes start with "$2")
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    return next(new Error('passwordHash must be a bcrypt hash; use user.setPassword()'));
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
