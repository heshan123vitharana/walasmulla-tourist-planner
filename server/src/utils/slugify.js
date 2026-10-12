'use strict';
/**
 * slugify.js — Convert a string to a URL-safe slug.
 *
 * Rules:
 *   - Lowercase
 *   - Replace spaces and special characters with hyphens
 *   - Remove consecutive hyphens
 *   - Trim leading/trailing hyphens
 *
 * @param {string} text
 * @returns {string} URL-safe slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                    // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')     // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')       // remove non-alphanumeric (keep spaces and hyphens)
    .replace(/[\s_]+/g, '-')            // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')                // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');           // trim leading/trailing hyphens
}

module.exports = { slugify };
