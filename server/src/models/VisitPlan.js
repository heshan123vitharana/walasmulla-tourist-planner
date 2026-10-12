'use strict';
const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const visitPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    startTime: {
      type: String,
      default: '08:00',
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be in HH:mm format'],
    },
    orderMode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    stops: {
      type: [stopSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'A plan can have at most 20 stops',
      },
    },
  },
  { timestamps: true }
);

/* ─── Indexes ──────────────────────────────────────────────────── */
visitPlanSchema.index({ user: 1, createdAt: -1 });

// ETAs are NEVER stored — they are computed on every generate/read call.
// The stops array contains only place references and order; all time data is ephemeral.

const VisitPlan = mongoose.model('VisitPlan', visitPlanSchema);
module.exports = VisitPlan;
