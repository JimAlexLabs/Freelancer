// src/controllers/jobs.controller.js
'use strict';

const { query, transaction } = require('../db/pool');
const logger = require('../utils/logger');

/** GET /jobs  — public job listing with filters */
async function listJobs(req, res) {
  const {
    page = 1, limit = 20, category, skills, min_budget, max_budget,
    status = 'open', sort = 'created_at', order = 'DESC', q
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ['j.status = $1'];
  const params = [status];

  if (category) { conditions.push(`j.category = $${params.push(category)}`); }
  if (min_budget) { conditions.push(`j.budget_max >= $${params.push(Number(min_budget))}`); }
  if (max_budget) { conditions.push(`j.budget_max <= $${params.push(Number(max_budget))}`); }
  if (skills) {
    const skillArr = skills.split(',').map(s => s.trim());
    conditions.push(`j.skills_required && $${params.push(skillArr)}`);
  }
  if (q) {
    conditions.push(`to_tsvector('english', j.title || ' ' || j.description) @@ plainto_tsquery('english', $${params.push(q)})`);
  }

  const where = conditions.join(' AND ');
  const sortCol = ['created_at','budget_max','apps_count'].includes(sort) ? sort : 'created_at';
  const sortDir = order === 'ASC' ? 'ASC' : 'DESC';

  try {
    const [{ rows }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT j.id, j.title, j.description, j.category, j.skills_required,
                j.budget_min, j.budget_max, j.duration_days, j.status,
                j.payment_status, j.apps_count, j.progress, j.created_at,
                u.name AS posted_by
         FROM jobs j
         JOIN users u ON u.id = j.created_by
         WHERE ${where}
         ORDER BY j.${sortCol} ${sortDir}
         LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(offset)}`,
        params
      ),
      query(`SELECT COUNT(*) FROM jobs j WHERE ${where}`, params.slice(0, -2)),
    ]);

    return res.json({
      jobs:  rows,
      total: parseInt(countRows[0].count),
      page:  parseInt(page),
      pages: Math.ceil(parseInt(countRows[0].count) / parseInt(limit)),
    });
  } catch (err) {
    logger.error('listJobs error', { error: err.message });
    return res.status(500).json({ error: 'Failed to list jobs' });
  }
}

/** GET /jobs/:id */
async function getJob(req, res) {
  try {
    const { rows } = await query(
      `SELECT j.*, u.name AS posted_by
       FROM jobs j JOIN users u ON u.id = j.created_by
       WHERE j.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Job not found' });
    return res.json({ job: rows[0] });
  } catch (err) {
    logger.error('getJob error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load job' });
  }
}

/** POST /jobs  — admin/client creates a job */
async function createJob(req, res) {
  const { title, description, category, skills_required = [],
          budget_min, budget_max, duration_days } = req.body;

  if (!title || !description || !category || !budget_max) {
    return res.status(400).json({ error: 'title, description, category, budget_max are required' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO jobs (created_by, title, description, category,
         skills_required, budget_min, budget_max, duration_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.user.id, title, description, category,
       Array.isArray(skills_required) ? skills_required : skills_required.split(',').map(s => s.trim()),
       budget_min || null, budget_max, duration_days || null]
    );

    await query(
      `INSERT INTO audit_log (user_id, action, description) VALUES ($1,'job.create',$2)`,
      [req.user.id, `Created job: ${title}`]
    ).catch(() => {});

    return res.status(201).json({ job: rows[0] });
  } catch (err) {
    logger.error('createJob error', { error: err.message });
    return res.status(500).json({ error: 'Failed to create job' });
  }
}

/** PATCH /jobs/:id */
async function updateJob(req, res) {
  const allowed = ['title','description','category','skills_required',
                   'budget_min','budget_max','duration_days','status','progress'];
  const sets = [];
  const vals = [req.params.id];

  allowed.forEach(k => {
    if (req.body[k] !== undefined) {
      sets.push(`${k} = $${vals.push(req.body[k])}`);
    }
  });

  if (!sets.length) return res.status(400).json({ error: 'No valid fields to update' });

  try {
    const { rows } = await query(
      `UPDATE jobs SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: 'Job not found' });
    return res.json({ job: rows[0] });
  } catch (err) {
    logger.error('updateJob error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update job' });
  }
}

module.exports = { listJobs, getJob, createJob, updateJob };
