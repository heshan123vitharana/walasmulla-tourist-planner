'use strict';
/**
 * app.js — Express application: middleware stack and route registration.
 *
 * Security middleware order (important):
 *   1. helmet (security headers)
 *   2. cors
 *   3. compression
 *   4. morgan (logging — NEVER logs request bodies to avoid leaking passwords)
 *   5. express.json (body parsing)
 *   6. noSqlSanitise (strip dangerous keys AFTER parsing, BEFORE routes)
 *   7. General rate limiter
 *   8. Routes
 *   9. 404 handler
 *  10. Global error handler
 */
require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const compression = require('compression');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const mongoose   = require('mongoose');

const { noSqlSanitise }  = require('./middleware/noSqlSanitise');
const { errorHandler }   = require('./middleware/errorHandler');

// Route modules (added incrementally across milestones)
const authRoutes  = require('./routes/auth');
// M2 routes (added in M2):
// const placeRoutes    = require('./routes/places');
// const categoryRoutes = require('./routes/categories');
// const planRoutes     = require('./routes/plans');
// const adminRoutes    = require('./routes/admin');

const app = express();

/* ─── Trust proxy (for rate limiting behind Nginx) ───────────── */
app.set('trust proxy', 1);

/* ─── Security headers ───────────────────────────────────────── */
app.use(
  helmet({
    // HSTS: only enable in production (HTTPS required)
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
  })
);

/* ─── CORS ───────────────────────────────────────────────────── */
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

/* ─── Compression ────────────────────────────────────────────── */
app.use(compression());

/* ─── Request logging ────────────────────────────────────────── */
// Use "tiny" format in production — NEVER log request bodies (would expose passwords)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

/* ─── Body parsing ───────────────────────────────────────────── */
app.use(express.json({ limit: '100kb' })); // reject oversized bodies
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

/* ─── NoSQL injection sanitisation ──────────────────────────── */
// Must come AFTER body parsing so req.body is available
app.use(noSqlSanitise);

/* ─── General rate limiter (loose — auth routes have tighter one) */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 200,             // 200 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api', generalLimiter);

/* ─── Routes ─────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

// Health check (useful for Docker / load balancer probes)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/* ─── 404 ────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ─── Global error handler ───────────────────────────────────── */
app.use(errorHandler);

/* ─── DB connection + server start ──────────────────────────── */
async function startServer() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/walasmulla_tourist';
  await mongoose.connect(mongoUri);
  console.info('[app] MongoDB connected');

  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, () => {
    console.info(`[app] Server listening on http://localhost:${PORT}`);
    console.info(`[app] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[app] Failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = app;
