// src/controllers/tickets.controller.js
'use strict';

const { query } = require('../db/pool');
const emailSvc  = require('../services/email.service');
const logger    = require('../utils/logger');

async function listTickets(req, res) {
  const isAgent = ['admin','support'].includes(req.user.role);
  const conditions = isAgent ? [] : ['t.user_id = $1'];
  const params = isAgent ? [] : [req.user.id];

  if (req.query.status) conditions.push(`t.status = $${params.push(req.query.status)}`);
  if (req.query.priority) conditions.push(`t.priority = $${params.push(req.query.priority)}`);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await query(
      `SELECT t.*, u.name AS user_name,
              (SELECT COUNT(*) FROM ticket_replies WHERE ticket_id = t.id) AS reply_count
       FROM tickets t JOIN users u ON u.id = t.user_id
       ${where}
       ORDER BY
         CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         t.created_at DESC`,
      params
    );
    return res.json({ tickets: rows });
  } catch (err) {
    logger.error('listTickets error', { error: err.message });
    return res.status(500).json({ error: 'Failed to list tickets' });
  }
}

async function createTicket(req, res) {
  const { subject, message, priority = 'medium' } = req.body;
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Subject and message required' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO tickets (user_id, subject, message, priority) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, subject.trim(), message.trim(), priority]
    );
    await query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ($1,'ticket.new',$2,$3)`,
      [req.user.id, 'Ticket submitted', `Your ticket "${subject}" has been received.`]
    ).catch(() => {});
    return res.status(201).json({ ticket: rows[0] });
  } catch (err) {
    logger.error('createTicket error', { error: err.message });
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
}

async function getTicket(req, res) {
  try {
    const { rows: t } = await query(
      `SELECT t.*, u.name AS user_name FROM tickets t
       JOIN users u ON u.id = t.user_id WHERE t.id = $1`,
      [req.params.id]
    );
    if (!t.length) return res.status(404).json({ error: 'Ticket not found' });
    // access check
    const isAgent = ['admin','support'].includes(req.user.role);
    if (!isAgent && t[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { rows: replies } = await query(
      `SELECT r.*, u.name AS from_name FROM ticket_replies r
       JOIN users u ON u.id = r.from_user WHERE r.ticket_id = $1 ORDER BY r.created_at ASC`,
      [req.params.id]
    );
    return res.json({ ticket: { ...t[0], replies } });
  } catch (err) {
    logger.error('getTicket error', { error: err.message });
    return res.status(500).json({ error: 'Failed to get ticket' });
  }
}

async function replyToTicket(req, res) {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Reply body required' });
  try {
    const { rows: t } = await query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (!t.length) return res.status(404).json({ error: 'Ticket not found' });

    await query(
      `INSERT INTO ticket_replies (ticket_id, from_user, body) VALUES ($1,$2,$3)`,
      [req.params.id, req.user.id, body.trim()]
    );
    await query(
      `UPDATE tickets SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    const isAgent = ['admin','support'].includes(req.user.role);
    if (isAgent) {
      const { rows: u } = await query('SELECT email, name FROM users WHERE id = $1', [t[0].user_id]);
      if (u.length) emailSvc.send(u[0].email, 'ticketReply', [u[0].name, t[0].subject]);
    }

    return res.status(201).json({ message: 'Reply sent' });
  } catch (err) {
    logger.error('replyToTicket error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send reply' });
  }
}

async function updateTicketStatus(req, res) {
  const { status } = req.body;
  const VALID = ['open','in_progress','resolved','closed'];
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Choose: ${VALID.join(', ')}` });
  }
  try {
    const extra = status === 'resolved' ? `, resolved_at = NOW()` : '';
    await query(
      `UPDATE tickets SET status = $1 ${extra}, updated_at = NOW() WHERE id = $2`,
      [status, req.params.id]
    );
    return res.json({ message: 'Status updated' });
  } catch (err) {
    logger.error('updateTicketStatus error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

module.exports = { listTickets, createTicket, getTicket, replyToTicket, updateTicketStatus };
