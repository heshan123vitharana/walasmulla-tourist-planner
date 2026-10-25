'use strict';
/**
 * adminController.js — Admin-only CRUD for places, categories, and users.
 */
const { z } = require('zod');
const PlaceService    = require('../services/PlaceService');
const CategoryService = require('../services/CategoryService');
const AdminService    = require('../services/AdminService');
const { createError } = require('../middleware/errorHandler');

/* ─── Helpers ─────────────────────────────────────────────────── */
function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw createError(400, 'Validation failed', errors);
  }
  return result.data;
}

/* ─── Places ──────────────────────────────────────────────────── */

const placeBodySchema = z.object({
  name:                 z.string().min(1).max(150),
  categories:           z.array(z.string()).min(1),
  description:          z.string().min(1).max(3000),
  visitDurationMinutes: z.number().int().min(5).max(480),
  location: z.object({
    type:        z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  }),
  openingHours:         z.object({ opensAt: z.string().nullable().optional(), closesAt: z.string().nullable().optional(), notes: z.string().optional() }).optional(),
  entryRequirements:    z.string().max(1000).optional(),
  travelTips:           z.array(z.string()).optional(),
  imageUrl:             z.string().url().nullable().optional().or(z.literal('')).transform(v => v === '' ? null : v),
  isActive:             z.boolean().optional(),
  distanceKm:           z.number().min(0).max(100).optional(),
});

async function adminListPlaces(req, res, next) {
  try { res.json(await PlaceService.adminListPlaces()); } catch (e) { next(e); }
}
async function adminCreatePlace(req, res, next) {
  try {
    const data  = validate(placeBodySchema, req.body);
    const place = await PlaceService.createPlace(data);
    res.status(201).json(place);
  } catch (e) { next(e); }
}
async function adminUpdatePlace(req, res, next) {
  try {
    const data  = validate(placeBodySchema.partial(), req.body);
    const place = await PlaceService.updatePlace(req.params.id, data);
    res.json(place);
  } catch (e) { next(e); }
}
async function adminDeletePlace(req, res, next) {
  try {
    await PlaceService.deletePlace(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

/* ─── Categories ──────────────────────────────────────────────── */

const categoryBodySchema = z.object({
  name:        z.string().min(1).max(50),
  icon:        z.string().optional(),
  description: z.string().max(500).optional(),
});

async function adminCreateCategory(req, res, next) {
  try {
    const data = validate(categoryBodySchema, req.body);
    const cat  = await CategoryService.createCategory(data);
    res.status(201).json(cat);
  } catch (e) { next(e); }
}
async function adminUpdateCategory(req, res, next) {
  try {
    const data = validate(categoryBodySchema.partial(), req.body);
    const cat  = await CategoryService.updateCategory(req.params.id, data);
    res.json(cat);
  } catch (e) { next(e); }
}
async function adminDeleteCategory(req, res, next) {
  try {
    await CategoryService.deleteCategory(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

/* ─── Users ───────────────────────────────────────────────────── */

async function adminListUsers(req, res, next) {
  try { res.json(await AdminService.listUsers()); } catch (e) { next(e); }
}
async function adminSetUserStatus(req, res, next) {
  try {
    const { status } = z.object({ status: z.enum(['active', 'blocked']) }).parse(req.body);
    const user = await AdminService.setUserStatus(req.user.id, req.params.id, status);
    res.json(user);
  } catch (e) { next(e); }
}
async function adminDeleteUser(req, res, next) {
  try {
    await AdminService.deleteUser(req.user.id, req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

module.exports = {
  adminListPlaces, adminCreatePlace, adminUpdatePlace, adminDeletePlace,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListUsers, adminSetUserStatus, adminDeleteUser,
};
