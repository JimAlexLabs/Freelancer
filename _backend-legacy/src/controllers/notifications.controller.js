// src/controllers/notifications.controller.js
'use strict';

const { query } = require('../db/pool');
const logger    = require('../utils/logger');

async function listNotifications(req, res) {
  const { unread_only } = req.query;
  const where = unread_only === 'true'
    ? 'WHERE user_id = $1 AND is_read = FALSE'
    : 'WHERE user_id = $1';
  try {
    const { rows } = await query(
      `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT 60`,
      [req.user.id]
    );
    const unreadCount = rows.filter(n => !n.is_read).length;
    return res.json({ notifications: rows, unread_count: unreadCount });
  } catch (err) {
    logger.error('listNotifications error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load notifications' });
  }
}

async function markRead(req, res) {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    logger.error('markRead error', { error: err.message });
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
}

async function markAllRead(req, res) {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    logger.error('markAllRead error', { error: err.message });
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
}

module.exports = { listNotifications, markRead, markAllRead };
