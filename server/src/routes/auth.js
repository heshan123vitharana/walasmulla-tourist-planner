'use strict';
/**
 * auth.js — Auth routes.
 *
 * Rate limiting is applied specifically to POST routes to prevent brute-force attacks.
 * The general app-level rate limiter is in app.js; this one is stricter.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/** Strict rate limit for auth endpoints: 15 requests per 15 minutes per IP. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
  skipSuccessfulRequests: false,
});

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me',        authenticate, me);

module.exports = router;
