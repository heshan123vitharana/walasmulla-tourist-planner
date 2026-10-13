'use strict';
/**
 * plansController.js — Controller for plan generation (public) and saved plans (tourist).
 */
const { z } = require('zod');
const PlanService = require('../services/PlanService');
const { createError } = require('../middleware/errorHandler');

/* ─── Zod Schemas ─────────────────────────────────────────────── */

const generateSchema = z.object({
  placeIds:    z.array(z.string().min(1)).min(1).max(20),
  startTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  orderMode:   z.enum(['auto', 'manual']).optional(),
  manualOrder: z.array(z.string()).optional(),
});

const savedPlanSchema = z.object({
  title:     z.string().min(1).max(100).optional(),
  placeIds:  z.array(z.string().min(1)).min(1).max(20),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  orderMode: z.enum(['auto', 'manual']).optional(),
});

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw createError(400, 'Validation failed', errors);
  }
  return result.data;
}

/* ─── Controllers ─────────────────────────────────────────────── */

/** POST /api/plans/generate — public */
async function generate(req, res, next) {
  try {
    const opts   = validate(generateSchema, req.body);
    const result = await PlanService.generatePlan(opts);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** GET /api/plans — tourist */
async function listPlans(req, res, next) {
  try {
    const plans = await PlanService.listPlans(req.user.id);
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

/** POST /api/plans — tourist */
async function createPlan(req, res, next) {
  try {
    const data = validate(savedPlanSchema, req.body);
    const plan = await PlanService.createSavedPlan(req.user.id, data);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
}

/** GET /api/plans/:id — tourist */
async function getPlan(req, res, next) {
  try {
    const plan = await PlanService.getPlan(req.user.id, req.params.id);
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/plans/:id — tourist */
async function updatePlan(req, res, next) {
  try {
    const data = validate(savedPlanSchema.partial(), req.body);
    const plan = await PlanService.updatePlan(req.user.id, req.params.id, data);
    res.json(plan);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/plans/:id — tourist */
async function deletePlan(req, res, next) {
  try {
    await PlanService.deletePlan(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, listPlans, createPlan, getPlan, updatePlan, deletePlan };
