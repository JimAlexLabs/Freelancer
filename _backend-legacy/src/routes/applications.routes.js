'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/applications.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/',     requireAuth, ctrl.listApplications);
router.patch('/:id', requireAuth, requireRole('admin','support'), ctrl.updateApplication);

module.exports = router;
