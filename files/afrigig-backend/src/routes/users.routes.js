'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl  = require('../controllers/users.controller');
const { requireAuth, requireEmailVerified } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.get('/profile/:id', ctrl.getProfile);

router.patch('/profile', requireAuth, requireEmailVerified, [
  body('skills').optional().isString(),
  body('experience').optional().isString(),
  body('hourly_rate').optional().isNumeric(),
], validate, ctrl.updateProfile);

router.patch('/profile/track', requireAuth, requireEmailVerified, [
  body('track').notEmpty().withMessage('Track required'),
], validate, ctrl.setTrack);

module.exports = router;
