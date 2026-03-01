// src/controllers/admin.controller.js
'use strict';

const { query } = require('../db/pool');
const emailSvc  = require('../services/email.service');
const logger    = require('../utils/logger');

/** GET /admin/stats */
async function getStats(req, res) {
  try {
    const [
      { rows: userStats },
      { rows: jobStats },
      { rows: payStats },
      { rows: ticketStats },
    ] = await Promise.all([
      query(`SELECT
        COUNT(*) FILTER (WHERE role='freelancer') AS total_freelancers,
        COUNT(*) FILTER (WHERE role='freelancer' AND fp.freelancer_status='APPROVED') AS approved,
        COUNT(*) FILTER (WHERE role='freelancer' AND fp.freelancer_status='UNDER_REVIEW') AS under_review,
        COUNT(*) FILTER (WHERE role='freelancer' AND fp.freelancer_status IN ('REGISTERED','PROFILE_COMPLETED','ASSESSMENT_PENDING')) AS new_reg
        FROM users u LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id`),
      query(`SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='open') AS open,
        COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status='completed') AS completed
        FROM jobs`),
      query(`SELECT
        COALESCE(SUM(amount) FILTER (WHERE status='holding'),0) AS escrow_held,
        COALESCE(SUM(amount) FILTER (WHERE status='released'),0) AS total_released
        FROM escrows`),
      query(`SELECT
        COUNT(*) FILTER (WHERE status='open') AS open,
        COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status='resolved') AS resolved
        FROM tickets`),
    ]);

    return res.json({
      users:    userStats[0],
      jobs:     jobStats[0],
      payments: payStats[0],
      tickets:  ticketStats[0],
    });
  } catch (err) {
    logger.error('getStats error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}

/** GET /admin/users */
async function listUsers(req, res) {
  const { role, status, fs, track, page = 1, limit = 50, q } = req.query;
  const conditions = [];
  const params = [];

  if (role)   conditions.push(`u.role = $${params.push(role)}`);
  if (status) conditions.push(`u.account_status = $${params.push(status)}`);
  if (fs)     conditions.push(`fp.freelancer_status = $${params.push(fs)}`);
  if (track)  conditions.push(`fp.track = $${params.push(track)}`);
  if (q)      conditions.push(`(u.name ILIKE $${params.push('%'+q+'%')} OR u.email ILIKE $${params.push('%'+q+'%')})`);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page)-1) * parseInt(limit);

  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.role, u.account_status, u.email_verified,
              u.country, u.created_at,
              fp.freelancer_status, fp.track, fp.assessment_pct,
              fp.queue_position, fp.is_online
       FROM users u
       LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(offset)}`,
      params
    );
    return res.json({ users: rows });
  } catch (err) {
    logger.error('listUsers error', { error: err.message });
    return res.status(500).json({ error: 'Failed to list users' });
  }
}

/** PATCH /admin/users/:id/status */
async function updateUserStatus(req, res) {
  const { action, reason } = req.body; // action: approve|reject|suspend|unsuspend|ban
  const userId = req.params.id;

  try {
    const { rows: u } = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1', [userId]
    );
    if (!u.length) return res.status(404).json({ error: 'User not found' });

    const user = u[0];

    if (action === 'approve') {
      await query(`UPDATE users SET account_status = 'active' WHERE id = $1`, [userId]);
      await query(
        `UPDATE freelancer_profiles SET freelancer_status = 'APPROVED', approved_at = NOW() WHERE user_id = $1`,
        [userId]
      );
      emailSvc.send(user.email, 'welcomeApproved', [user.name]);
      await query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1,'review.approved','🎉 Application Approved!','Your AfriGig application has been approved. Start browsing jobs!')`,
        [userId]
      );
    } else if (action === 'reject') {
      await query(`UPDATE users SET account_status = 'banned' WHERE id = $1`, [userId]);
      await query(
        `UPDATE freelancer_profiles SET freelancer_status = 'REJECTED', rejection_reason = $1 WHERE user_id = $2`,
        [reason || 'Did not meet our standards', userId]
      );
      await query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1,'review.rejected','Application Not Approved',$2)`,
        [userId, `Your application was not approved. Reason: ${reason || 'Did not meet our standards'}`]
      );
    } else if (action === 'suspend') {
      await query(`UPDATE users SET account_status = 'suspended' WHERE id = $1`, [userId]);
      await query(
        `UPDATE freelancer_profiles SET freelancer_status = 'SUSPENDED' WHERE user_id = $1`,
        [userId]
      );
    } else if (action === 'unsuspend') {
      await query(`UPDATE users SET account_status = 'active' WHERE id = $1`, [userId]);
      await query(
        `UPDATE freelancer_profiles SET freelancer_status = 'APPROVED' WHERE user_id = $1`,
        [userId]
      );
    } else if (action === 'ban') {
      await query(`UPDATE users SET account_status = 'banned' WHERE id = $1`, [userId]);
    } else {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    await query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
       VALUES ($1,$2,$3,$4)`,
      [req.user.id, `admin.user.${action}`,
       `${action} on user ${user.name} (${user.email})${reason ? ': ' + reason : ''}`,
       req.ip]
    );

    return res.json({ message: `User ${action} successful` });
  } catch (err) {
    logger.error('updateUserStatus error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update user status' });
  }
}

/** GET /admin/reviews  — FIFO queue of UNDER_REVIEW freelancers */
async function getReviewQueue(req, res) {
  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.country, u.created_at,
              fp.freelancer_status, fp.track, fp.skills, fp.experience,
              fp.bio, fp.portfolio_links, fp.assessment_pct, fp.assessment_score,
              fp.assessment_max, fp.assessment_submitted_at,
              fp.queue_position, fp.review_deadline, fp.hourly_rate
       FROM users u
       JOIN freelancer_profiles fp ON fp.user_id = u.id
       WHERE fp.freelancer_status = 'UNDER_REVIEW'
       ORDER BY fp.assessment_submitted_at ASC NULLS LAST`,
    );
    return res.json({ queue: rows, count: rows.length });
  } catch (err) {
    logger.error('getReviewQueue error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load review queue' });
  }
}

/** GET /admin/audit-log */
async function getAuditLog(req, res) {
  const { page = 1, limit = 100, action } = req.query;
  const offset = (parseInt(page)-1) * parseInt(limit);
  const where  = action ? `WHERE l.action ILIKE $3` : '';
  const params = action
    ? [parseInt(limit), offset, `%${action}%`]
    : [parseInt(limit), offset];

  try {
    const { rows } = await query(
      `SELECT l.*, u.name AS user_name, u.email AS user_email
       FROM audit_log l LEFT JOIN users u ON u.id = l.user_id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );
    return res.json({ log: rows });
  } catch (err) {
    logger.error('getAuditLog error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load audit log' });
  }
}

/** GET /admin/email-log */
async function getEmailLog(req, res) {
  try {
    const { rows } = await query(
      `SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 200`
    );
    return res.json({ emails: rows });
  } catch (err) {
    logger.error('getEmailLog error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load email log' });
  }
}

module.exports = {
  getStats, listUsers, updateUserStatus, getReviewQueue, getAuditLog, getEmailLog,
};
