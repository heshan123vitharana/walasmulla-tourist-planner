'use strict';
const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const openingHoursSchema = new mongoose.Schema(
  {
    opensAt:  { type: String, default: null, match: [/^([01]\d|2[0-3]):[0-5]\d$|^null$/, 'opensAt must be in HH:mm format'] },
    closesAt: { type: String, default: null, match: [/^([01]\d|2[0-3]):[0-5]\d$|^null$/, 'closesAt must be in HH:mm format'] },
    notes:    { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [150, 'Place name must be at most 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'A place must have at least one category',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description must be at most 3000 characters'],
    },
    openingHours: {
      type: openingHoursSchema,
      default: () => ({}),
    },
    entryRequirements: {
      type: String,
      trim: true,
      maxlength: [1000, 'Entry requirements must be at most 1000 characters'],
    },
    travelTips: {
      type: [String],
      default: [],
    },
    visitDurationMinutes: {
      type: Number,
      required: [true, 'Visit duration is required'],
      min: [5, 'Visit duration must be at least 5 minutes'],
      max: [480, 'Visit duration must be at most 480 minutes (8 hours)'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON standard
        required: true,
        validate: {
          validator: (arr) => arr.length === 2 && arr[0] >= -180 && arr[0] <= 180 && arr[1] >= -90 && arr[1] <= 90,
          message: 'coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },
    distanceKm: {
      type: Number,
      min: [0, 'Distance cannot be negative'],
      max: [100, 'Distance must be at most 100 km'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ─── Indexes ──────────────────────────────────────────────────── */
placeSchema.index({ location: '2dsphere' });          // geospatial queries
placeSchema.index({ name: 'text' });                  // text search (REQ-1.3)
placeSchema.index({ categories: 1 });                 // category filter
placeSchema.index({ isActive: 1 });                   // active filter
placeSchema.index({ slug: 1 }, { unique: true });

/* ─── Auto-generate slug on save ──────────────────────────────── */
placeSchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('name')) {
    if (!this.slug || this.slug === '') {
      this.slug = slugify(this.name);
    }
  }
  next();
});

/* ─── Public visibility rule (D6) ─────────────────────────────── */
// A place is publicly visible if isActive === true AND categories.length >= 1.
// The API enforces this at query time; the model enforces the min-1-category rule.

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
