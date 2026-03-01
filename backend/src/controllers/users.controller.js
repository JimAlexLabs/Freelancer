// src/controllers/users.controller.js
'use strict';

const { query } = require('../db/pool');
const logger    = require('../utils/logger');

/** GET /users/profile/:id  — public freelancer profile */
async function getProfile(req, res) {
  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.country, u.avatar_url, u.created_at,
              fp.track, fp.skills, fp.experience, fp.availability, fp.bio,
              fp.portfolio_links, fp.hourly_rate, fp.assessment_pct,
              fp.freelancer_status, fp.approved_at, fp.is_online, fp.last_seen_at
       FROM users u
       JOIN freelancer_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'freelancer'
         AND fp.freelancer_status = 'APPROVED'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Profile not found' });
    return res.json({ profile: rows[0] });
  } catch (err) {
    logger.error('getProfile error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}

/** PATCH /users/profile  — update own freelancer profile */
async function updateProfile(req, res) {
  const allowed = ['skills', 'experience', 'availability', 'bio',
                   'portfolio_links', 'hourly_rate', 'track', 'country', 'phone'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  try {
    // Update user table fields (country, phone)
    if (updates.country || updates.phone) {
      const userFields = [];
      const userVals   = [];
      if (updates.country) { userFields.push(`country = $${userFields.length + 2}`); userVals.push(updates.country); }
      if (updates.phone)   { userFields.push(`phone = $${userFields.length + 2}`);   userVals.push(updates.phone);   }
      if (userFields.length) {
        await query(
          `UPDATE users SET ${userFields.join(', ')} WHERE id = $1`,
          [req.user.id, ...userVals]
        );
      }
    }

    // Update freelancer_profiles fields
    const fpFields = ['skills', 'experience', 'availability', 'bio', 'portfolio_links', 'hourly_rate'];
    const fpUpdates = fpFields.filter(k => updates[k] !== undefined);
    if (fpUpdates.length) {
      const setClauses = fpUpdates.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const vals = fpUpdates.map(k => updates[k]);
      await query(
        `UPDATE freelancer_profiles SET ${setClauses} WHERE user_id = $1`,
        [req.user.id, ...vals]
      );
    }

    // Advance status: REGISTERED → PROFILE_COMPLETED if all required fields present
    const { rows } = await query(
      `SELECT skills, experience, country FROM freelancer_profiles fp
       JOIN users u ON u.id = fp.user_id
       WHERE fp.user_id = $1 AND fp.freelancer_status = 'REGISTERED'`,
      [req.user.id]
    );
    if (rows.length && rows[0].skills && rows[0].experience) {
      await query(
        `UPDATE freelancer_profiles SET freelancer_status = 'PROFILE_COMPLETED' WHERE user_id = $1`,
        [req.user.id]
      );
    }

    await query(
      `INSERT INTO audit_log (user_id, action, description) VALUES ($1, 'profile.update', 'Profile updated')`,
      [req.user.id]
    ).catch(() => {});

    return res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    logger.error('updateProfile error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

/** PATCH /users/profile/track  — set track (once only) */
async function setTrack(req, res) {
  const { track } = req.body;
  const VALID = ['software','uiux','data','devops','writing','nontech'];
  if (!VALID.includes(track)) {
    return res.status(400).json({ error: `Invalid track. Choose: ${VALID.join(', ')}` });
  }
  try {
    const { rows } = await query(
      'SELECT freelancer_status, track FROM freelancer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Profile not found' });
    if (rows[0].track) return res.status(409).json({ error: 'Track already set and cannot be changed' });
    if (rows[0].freelancer_status !== 'PROFILE_COMPLETED') {
      return res.status(400).json({ error: 'Complete your profile before selecting a track' });
    }
    await query(
      `UPDATE freelancer_profiles SET track = $1, freelancer_status = 'ASSESSMENT_PENDING' WHERE user_id = $2`,
      [track, req.user.id]
    );
    return res.json({ message: 'Track set successfully', track, next_step: 'Pay assessment fee' });
  } catch (err) {
    logger.error('setTrack error', { error: err.message });
    return res.status(500).json({ error: 'Failed to set track' });
  }
}

module.exports = { getProfile, updateProfile, setTrack };
