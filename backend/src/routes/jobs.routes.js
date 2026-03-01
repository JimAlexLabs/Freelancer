'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl  = require('../controllers/jobs.controller');
const appCtrl = require('../controllers/applications.controller');
const { requireAuth, requireRole, requireEmailVerified } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.get('/', ctrl.listJobs);
router.get('/:id', ctrl.getJob);

router.post('/', requireAuth, requireRole('admin','support'), [
  body('title').notEmpty().trim(),
  body('description').isLength({ min: 20 }),
  body('category').notEmpty(),
  body('budget_max').isNumeric({ min: 1 }),
], validate, ctrl.createJob);

router.patch('/:id', requireAuth, requireRole('admin','support'), ctrl.updateJob);

// Applications on a job
router.post('/:id/applications',
  requireAuth, requireEmailVerified,
  requireRole('freelancer'),
  [
    body('cover_letter').isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters'),
    body('bid_amount').isNumeric({ min: 1 }),
    body('est_days').optional().isInt({ min: 1 }),
  ],
  validate,
  appCtrl.apply
);

module.exports = router;
