'use strict';
const express = require('express');
const { generate, listPlans, createPlan, getPlan, updatePlan, deletePlan } = require('../controllers/plansController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// Public — generate itinerary preview (no login required)
router.post('/generate', generate);

// Tourist — saved plans (authentication required)
router.use(authenticate);
router.get('/',     listPlans);
router.post('/',    createPlan);
router.get('/:id',  getPlan);
router.put('/:id',  updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
