'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/messages.controller');
const { requireAuth, requireEmailVerified } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.get('/conversations', requireAuth, ctrl.listConversations);

router.post('/conversations', requireAuth, requireEmailVerified, [
  body('recipient_id').notEmpty(),
  body('message').notEmpty(),
], validate, ctrl.startConversation);

router.get('/conversations/:id',  requireAuth, ctrl.getMessages);

router.post('/conversations/:id/messages', requireAuth, requireEmailVerified, [
  body('body').notEmpty().withMessage('Message body required'),
], validate, ctrl.sendMessage);

module.exports = router;
