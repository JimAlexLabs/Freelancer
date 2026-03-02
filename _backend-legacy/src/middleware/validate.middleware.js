// src/middleware/validate.middleware.js
// Centralised express-validator rule sets + error handler

const { body, param, query: qv, validationResult } = require('express-validator');

/**
 * Attach to any route after validator chains.
 * Returns 422 with structured errors if any validation fails.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({
      field:   e.path,
      message: e.msg,
    }));
    return res.status(422).json({ error: 'Validation failed', details: formatted });
  }
  next();
}

// ── Auth rules ───────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
  body('email')
    .trim().toLowerCase().isEmail().withMessage('Valid email address required')
    .isLength({ max: 255 }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
];

const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const forgotPasswordRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Valid email required'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];

const changePasswordRules = [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];

// ── Profile rules ────────────────────────────────────────────
const profileRules = [
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience').optional().isString().isLength({ max: 2000 }),
  body('availability').optional().isIn(['Full-time','Part-time','Weekends only','Project-based']),
  body('country').optional().isString().isLength({ max: 80 }),
  body('bio').optional().isString().isLength({ max: 2000 }),
];

// ── Job rules ────────────────────────────────────────────────
const createJobRules = [
  body('title').trim().notEmpty().withMessage('Job title required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description required').isLength({ min: 50, max: 10000 }),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('budget_max').isFloat({ min: 100 }).withMessage('Max budget must be at least 100'),
  body('budget_min').optional().isFloat({ min: 0 }),
  body('duration_days').optional().isInt({ min: 1, max: 365 }),
  body('skills_required').optional().isArray(),
];

// ── Application rules ────────────────────────────────────────
const applicationRules = [
  body('cover_letter').trim().notEmpty().isLength({ min: 50, max: 5000 })
    .withMessage('Cover letter must be 50–5000 characters'),
  body('bid_amount').isFloat({ min: 100 }).withMessage('Bid amount must be at least 100'),
  body('est_days').isInt({ min: 1, max: 365 }).withMessage('Estimated days must be 1–365'),
];

// ── Message rules ────────────────────────────────────────────
const messageRules = [
  body('body').trim().notEmpty().isLength({ max: 10000 }).withMessage('Message required'),
  body('recipient_id').isUUID().withMessage('Valid recipient ID required'),
];

// ── Ticket rules ─────────────────────────────────────────────
const ticketRules = [
  body('subject').trim().notEmpty().isLength({ max: 300 }).withMessage('Subject required'),
  body('message').trim().notEmpty().isLength({ min: 10, max: 5000 }).withMessage('Message required (min 10 chars)'),
  body('priority').optional().isIn(['low','medium','high','urgent']),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  profileRules,
  createJobRules,
  applicationRules,
  messageRules,
  ticketRules,
};
