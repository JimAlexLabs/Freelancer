'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const adminOnly = [requireAuth, requireRole('admin')];
const agentOnly = [requireAuth, requireRole('admin', 'support')];

router.get('/stats',            ...agentOnly, ctrl.getStats);
router.get('/users',            ...agentOnly, ctrl.listUsers);
router.patch('/users/:id/status', ...adminOnly, [
  body('action').notEmpty(),
], validate, ctrl.updateUserStatus);
router.get('/reviews',          ...agentOnly, ctrl.getReviewQueue);
router.get('/audit-log',        ...adminOnly, ctrl.getAuditLog);
router.get('/email-log',        ...adminOnly, ctrl.getEmailLog);

module.exports = router;
