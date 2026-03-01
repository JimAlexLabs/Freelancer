'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/tickets.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.get('/',    requireAuth, ctrl.listTickets);
router.post('/',   requireAuth, [
  body('subject').notEmpty().trim().isLength({ max: 300 }),
  body('message').notEmpty().trim().isLength({ min: 10 }),
], validate, ctrl.createTicket);

router.get('/:id',   requireAuth, ctrl.getTicket);
router.post('/:id/replies', requireAuth, [
  body('body').notEmpty().trim(),
], validate, ctrl.replyToTicket);
router.patch('/:id/status', requireAuth, requireRole('admin','support'), [
  body('status').notEmpty(),
], validate, ctrl.updateTicketStatus);

module.exports = router;
