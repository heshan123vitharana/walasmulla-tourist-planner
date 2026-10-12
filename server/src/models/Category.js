'use strict';
const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name must be at most 50 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Tag', // lucide-react icon name
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
    },
  },
  { timestamps: true }
);

/* ─── Auto-generate slug on save ──────────────────────────────── */
categorySchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('name')) {
    if (!this.slug || this.slug === '') {
      this.slug = slugify(this.name);
    }
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
