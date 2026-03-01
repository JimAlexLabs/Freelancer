// src/routes/auth.routes.js
'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const auth   = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  authLimiter, passwordResetLimiter, resendVerifyLimiter,
} = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');

// POST /auth/register
router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6–128 characters'),
], validate, auth.register);

// POST /auth/login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
], validate, auth.login);

// POST /auth/refresh
router.post('/refresh', auth.refresh);

// POST /auth/logout  (optionally authenticated — works either way)
router.post('/logout', auth.logout);

// POST /auth/logout-all  (must be authenticated)
router.post('/logout-all', requireAuth, auth.logoutAll);

// GET /auth/verify-email?token=...
router.get('/verify-email', auth.verifyEmail);

// POST /auth/resend-verification
router.post('/resend-verification', resendVerifyLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, auth.resendVerification);

// POST /auth/forgot-password
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, auth.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', passwordResetLimiter, [
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6–128 characters'),
], validate, auth.resetPassword);

// POST /auth/change-password  (authenticated)
router.post('/change-password', requireAuth, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6, max: 128 }),
], validate, auth.changePassword);

// GET /auth/me
router.get('/me', requireAuth, auth.me);

module.exports = router;
