// src/middleware/rateLimit.middleware.js
// Layered rate limits — general API + stricter auth-specific limits

const rateLimit = require('express-rate-limit');
const logger    = require('../utils/logger');

function onLimitReached(req, res) {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent'),
  });
}

/**
 * General API rate limit — 100 req / 15 min per IP
 */
const apiLimiter = rateLimit({
  windowMs:         parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:              parseInt(process.env.RATE_LIMIT_MAX       || '100'),
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many requests. Please try again later.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res);
    res.status(429).json(options.message);
  },
});

/**
 * Auth endpoints — 10 req / 15 min per IP
 * Protects against brute-force on /login, /register, /forgot-password
 */
const authLimiter = rateLimit({
  windowMs:         parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:              parseInt(process.env.AUTH_RATE_LIMIT_MAX  || '10'),
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many authentication attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed/all depending on endpoint
  handler: (req, res, next, options) => {
    onLimitReached(req, res);
    res.status(429).json(options.message);
  },
});

/**
 * Password reset — very strict: 3 req / 1 hour per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset attempts. Try again in 1 hour.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res);
    res.status(429).json(options.message);
  },
});

/**
 * Email verification resend — 3 req / 1 hour per IP
 */
const resendVerifyLimiter = rateLimit({
  windowMs: 3600000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many resend requests. Try again in 1 hour.' },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  resendVerifyLimiter,
};
