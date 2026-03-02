// src/controllers/applications.controller.js
'use strict';

const { query, transaction } = require('../db/pool');
const emailSvc = require('../services/email.service');
const logger   = require('../utils/logger');

/** POST /jobs/:id/applications */
async function apply(req, res) {
  const { cover_letter, bid_amount, est_days } = req.body;
  const jobId = req.params.id;

  if (!cover_letter || cover_letter.length < 50) {
    return res.status(400).json({ error: 'Cover letter must be at least 50 characters' });
  }
  if (!bid_amount || bid_amount <= 0) {
    return res.status(400).json({ error: 'Valid bid amount required' });
  }

  try {
    // Check freelancer is approved
    const { rows: profile } = await query(
      `SELECT freelancer_status FROM freelancer_profiles WHERE user_id = $1`,
      [req.user.id]
    );
    if (!profile.length || profile[0].freelancer_status !== 'APPROVED') {
      return res.status(403).json({ error: 'Only approved freelancers can apply to jobs' });
    }

    // Check job exists and is open
    const { rows: job } = await query(
      `SELECT id, title, status, created_by FROM jobs WHERE id = $1`,
      [jobId]
    );
    if (!job.length) return res.status(404).json({ error: 'Job not found' });
    if (job[0].status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    const app = await transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO applications (job_id, user_id, cover_letter, bid_amount, est_days)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [jobId, req.user.id, cover_letter, bid_amount, est_days || null]
      );
      await client.query(
        `UPDATE jobs SET apps_count = apps_count + 1 WHERE id = $1`,
        [jobId]
      );
      return rows[0];
    });

    // Notify job poster (non-blocking)
    const { rows: poster } = await query(
      `SELECT u.email, u.name FROM users u WHERE u.id = $1`,
      [job[0].created_by]
    );
    if (poster.length) {
      emailSvc.send(poster[0].email, 'applicationReceived',
        [poster[0].name, req.user.name, job[0].title]);
    }

    return res.status(201).json({ application: app });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'You have already applied to this job' });
    }
    logger.error('apply error', { error: err.message });
    return res.status(500).json({ error: 'Failed to submit application' });
  }
}

/** GET /applications  — own applications */
async function listApplications(req, res) {
  const { status, job_id } = req.query;
  const conditions = ['a.user_id = $1'];
  const params = [req.user.id];

  if (status) conditions.push(`a.status = $${params.push(status)}`);
  if (job_id) conditions.push(`a.job_id = $${params.push(job_id)}`);

  try {
    const { rows } = await query(
      `SELECT a.*, j.title AS job_title, j.budget_max, j.category
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.created_at DESC`,
      params
    );
    return res.json({ applications: rows });
  } catch (err) {
    logger.error('listApplications error', { error: err.message });
    return res.status(500).json({ error: 'Failed to list applications' });
  }
}

/** PATCH /applications/:id  — update status (admin/client) */
async function updateApplication(req, res) {
  const { status } = req.body;
  const VALID = ['viewed','shortlisted','accepted','rejected','withdrawn'];
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Choose: ${VALID.join(', ')}` });
  }
  try {
    const { rows } = await query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found' });

    if (status === 'accepted') {
      // Assign the job to the freelancer
      await query(
        `UPDATE jobs SET assigned_to = $1, status = 'in_progress' WHERE id = $2`,
        [rows[0].user_id, rows[0].job_id]
      );
    }

    return res.json({ application: rows[0] });
  } catch (err) {
    logger.error('updateApplication error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update application' });
  }
}

module.exports = { apply, listApplications, updateApplication };
