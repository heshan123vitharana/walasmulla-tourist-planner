'use strict';
/**
 * categoriesController.js — Thin controller for public category endpoints.
 */
const CategoryService = require('../services/CategoryService');

async function listCategories(req, res, next) {
  try {
    const categories = await CategoryService.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories };
