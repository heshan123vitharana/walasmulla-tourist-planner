'use strict';
/**
 * authController.js — Thin controller: validates input, calls AuthService, sends response.
 */
const { z } = require('zod');
const AuthService = require('../services/AuthService');
const { createError } = require('../middleware/errorHandler');

/* ─── Zod Schemas ─────────────────────────────────────────────── */

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_]+$/i, 'Username may only contain letters, digits and underscores')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * Parse a Zod schema and throw a 400 HTTP error on failure.
 * @template T
 * @param {z.ZodSchema<T>} schema
 * @param {unknown} data
 * @returns {T}
 */
function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw createError(400, 'Validation failed', errors);
  }
  return result.data;
}

/* ─── Controllers ─────────────────────────────────────────────── */

/**
 * POST /api/auth/register
 * Tourist self-registration only. Admins cannot self-register.
 */
async function register(req, res, next) {
  try {
    const { username, password } = validate(registerSchema, req.body);
    const result = await AuthService.register(username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Accepts tourist + admin credentials.
 */
async function login(req, res, next) {
  try {
    const { username, password } = validate(loginSchema, req.body);
    const result = await AuthService.login(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
async function me(req, res, next) {
  try {
    const user = await AuthService.me(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
