// src/routes/index.js — Master router
'use strict';

const router = require('express').Router();

const authRoutes          = require('./auth.routes');
const usersRoutes         = require('./users.routes');
const jobsRoutes          = require('./jobs.routes');
const applicationsRoutes  = require('./applications.routes');
const messagesRoutes      = require('./messages.routes');
const ticketsRoutes       = require('./tickets.routes');
const paymentsRoutes      = require('./payments.routes');
const notificationsRoutes = require('./notifications.routes');
const adminRoutes         = require('./admin.routes');

router.use('/auth',          authRoutes);
router.use('/users',         usersRoutes);
router.use('/jobs',          jobsRoutes);
router.use('/applications',  applicationsRoutes);
router.use('/messages',      messagesRoutes);
router.use('/tickets',       ticketsRoutes);
router.use('/payments',      paymentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin',         adminRoutes);

router.get('/', (_req, res) => {
  res.json({ name: 'AfriGig API', version: 'v1', status: 'operational' });
});

module.exports = router;
