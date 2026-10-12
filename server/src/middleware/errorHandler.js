'use strict';
/**
 * errorHandler.js — Global Express error-handling middleware.
 *
 * Rules:
 *   - Never expose stack traces in production.
 *   - Never expose internal error messages that could leak implementation details.
 *   - Consistent { message, errors? } response shape.
 *   - Map known error types (Mongoose validation, cast errors, duplicate key) to 4xx.
 */

/**
 * Global error handler — must have 4 parameters for Express to recognise it.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log every server error (never log passwords or tokens)
  console.error(`[errorHandler] ${req.method} ${req.path} →`, err.message);
  if (isDev) console.error(err.stack);

  /* ── Mongoose Validation Error ─────────────────────────────── */
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ message: 'Validation failed', errors });
  }

  /* ── Mongoose Duplicate Key (E11000) ───────────────────────── */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      message: `A record with that ${field} already exists`,
    });
  }

  /* ── Mongoose Cast Error (invalid ObjectId, etc.) ──────────── */
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for field: ${err.path}` });
  }

  /* ── JWT Errors ─────────────────────────────────────────────── */
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  /* ── Application-level HTTP Errors (created with statusCode) ── */
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  /* ── Fallback: 500 Internal Server Error ────────────────────── */
  res.status(500).json({
    message: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * Create an HTTP error with a status code.
 * @param {number} statusCode
 * @param {string} message
 * @param {Array} [errors]
 * @returns {Error}
 */
function createError(statusCode, message, errors) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (errors) err.errors = errors;
  return err;
}

module.exports = { errorHandler, createError };
