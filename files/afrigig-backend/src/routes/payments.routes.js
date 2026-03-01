'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/payments.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.post('/escrow/deposit', requireAuth, requireRole('admin'), [
  body('job_id').notEmpty(),
  body('amount').isNumeric({ min: 1 }).withMessage('Positive amount required'),
], validate, ctrl.depositEscrow);

router.post('/escrow/:id/release', requireAuth, requireRole('admin'), ctrl.releaseEscrow);

router.get('/wallet',       requireAuth, ctrl.getWallet);
router.get('/transactions', requireAuth, ctrl.listTransactions);

module.exports = router;
