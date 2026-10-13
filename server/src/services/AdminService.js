'use strict';
/**
 * AdminService.js — Admin-only operations for managing users.
 * Place and category admin operations live in PlaceService / CategoryService.
 */
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

/**
 * List all users (tourist + admin). Excludes passwordHash.
 * @returns {Promise<object[]>}
 */
async function listUsers() {
  return User.find().select('-passwordHash -__v').lean();
}

/**
 * Set a user's status (active | blocked).
 * Admins cannot block themselves.
 * @param {string} requestingAdminId
 * @param {string} targetId
 * @param {'active'|'blocked'} status
 * @returns {Promise<object>}
 */
async function setUserStatus(requestingAdminId, targetId, status) {
  if (requestingAdminId === targetId) {
    throw createError(400, 'An admin cannot change their own status');
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { status },
    { new: true, runValidators: true }
  ).select('-passwordHash -__v');

  if (!user) throw createError(404, 'User not found');
  return user.toObject();
}

/**
 * Delete a user account (admin). Admins cannot delete themselves.
 * @param {string} requestingAdminId
 * @param {string} targetId
 */
async function deleteUser(requestingAdminId, targetId) {
  if (requestingAdminId === targetId) {
    throw createError(400, 'An admin cannot delete their own account');
  }

  const user = await User.findByIdAndDelete(targetId);
  if (!user) throw createError(404, 'User not found');
}

module.exports = { listUsers, setUserStatus, deleteUser };
