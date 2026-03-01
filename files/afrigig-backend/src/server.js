// src/server.js — AfriGig API Entry Point
'use strict';

require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const routes     = require('./routes');
const logger     = require('./utils/logger');
const { ping }   = require('./db/pool');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ─────────────────────────────────────────
app.set('trust proxy', 1); // trust first proxy (for correct req.ip behind nginx)

app.use(helmet({
  crossOriginEmbedderPolicy: false,   // allow claude.ai iframe if needed
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

// ── CORS ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,           // allow cookies (refresh token)
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Request-ID'],
  exposedHeaders: ['X-Request-ID','X-RateLimit-Remaining'],
}));

// ── Body & Cookie parsing ─────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ── Request ID middleware ─────────────────────────────────────
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || require('crypto').randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
});

// ── Request logger (dev only) ─────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, { ip: req.ip, body: req.body });
    next();
  });
}

// ── Global rate limit ─────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    const dbTime = await ping();
    return res.json({
      status:  'ok',
      version: process.env.npm_package_version || '3.0.0',
      db:      'connected',
      dbTime,
      env:     process.env.NODE_ENV,
    });
  } catch (err) {
    return res.status(503).json({ status: 'error', db: 'unreachable', error: err.message });
  }
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }

  logger.error('Unhandled error', {
    error:     err.message,
    stack:     process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path:      req.path,
    requestId: req.requestId,
  });

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────
async function start() {
  try {
    await ping();
    logger.info('✅ PostgreSQL connected');
  } catch (err) {
    logger.error('❌ Cannot connect to PostgreSQL', { error: err.message });
    logger.error('   Run: npm run migrate  to create tables first');
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(`🚀 AfriGig API running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV}`);
    logger.info(`   Docs: http://localhost:${PORT}/api/v1`);
  });
}

start();

module.exports = app; // for supertest
