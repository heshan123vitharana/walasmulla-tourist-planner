'use strict';
/**
 * CategoryService.js — Business logic for categories.
 */
const Category = require('../models/Category');
const Place    = require('../models/Place');
const { createError } = require('../middleware/errorHandler');

/**
 * Return all categories (used publicly for filter chips).
 * @returns {Promise<object[]>}
 */
async function listCategories() {
  return Category.find().select('-__v').lean();
}

/**
 * Create a category (admin).
 * @param {object} data - { name, icon?, description? }
 * @returns {Promise<object>}
 */
async function createCategory(data) {
  const cat = new Category(data);
  await cat.save();
  return cat.toObject();
}

/**
 * Update a category (admin).
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
async function updateCategory(id, updates) {
  const cat = await Category.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!cat) throw createError(404, 'Category not found');
  return cat.toObject();
}

/**
 * Delete a category (admin). Fails if any place uses it.
 * @param {string} id
 */
async function deleteCategory(id) {
  const cat = await Category.findById(id);
  if (!cat) throw createError(404, 'Category not found');

  const usedBy = await Place.countDocuments({ categories: id });
  if (usedBy > 0) {
    throw createError(
      409,
      `Cannot delete: ${usedBy} place(s) use this category. Reassign them first.`
    );
  }

  await cat.deleteOne();
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
