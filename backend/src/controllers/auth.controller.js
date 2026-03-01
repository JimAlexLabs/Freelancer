// src/controllers/auth.controller.js
// All authentication flows in one place

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../db/pool');
const jwtUtil  = require('../utils/jwt');
const email    = require('../services/email.service');
const logger   = require('../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// ── Helpers ──────────────────────────────────────────────────

async function auditLog(userId, action, description, ip) {
  await query(
    `INSERT INTO audit_log (user_id, action, description, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [userId, action, description, ip || null]
  ).catch(() => {});
}

async function createWallet(client, userId) {
  await client.query(
    `INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function createFreelancerProfile(client, userId) {
  await client.query(
    `INSERT INTO freelancer_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
    path:     '/api/v1/auth',            // scope cookie to auth routes
  });
}

// ── Controllers ──────────────────────────────────────────────

/**
 * POST /auth/register
 * Creates user, sends verification email.
 */
async function register(req, res) {
  const { name, email: rawEmail, password } = req.body;
  const emailLower = rawEmail.trim().toLowerCase();

  try {
    // Check duplicate
    const existing = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verifyToken  = jwtUtil.generateOneTimeToken('24h');

    const user = await transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users
           (name, email, password_hash, role, account_status,
            email_verified, email_verify_token, email_verify_expires)
         VALUES ($1,$2,$3,'freelancer','pending',FALSE,$4,$5)
         RETURNING id, name, email, role, account_status`,
        [name.trim(), emailLower, passwordHash, verifyToken.hash, verifyToken.expiresAt]
      );
      const newUser = rows[0];
      await createFreelancerProfile(client, newUser.id);
      await createWallet(client, newUser.id);
      return newUser;
    });

    // Send verify email (non-blocking)
    email.send(user.email, 'verifyEmail', [user.name, verifyToken.token]);

    await auditLog(user.id, 'auth.register', `New registration: ${emailLower}`, req.ip);

    logger.info('New user registered', { userId: user.id, email: emailLower });

    return res.status(201).json({
      message: 'Account created. Check your email to verify your address.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error('Register error', { error: err.message, email: emailLower });
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

/**
 * POST /auth/login
 * Returns access token + sets refresh token cookie.
 */
async function login(req, res) {
  const { email: rawEmail, password } = req.body;
  const emailLower = rawEmail.trim().toLowerCase();

  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, role, account_status, email_verified
       FROM users WHERE email = $1`,
      [emailLower]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Account state checks
    if (user.account_status === 'banned') {
      return res.status(403).json({ error: 'Account banned. Contact support@afrigig.com' });
    }
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Issue tokens
    const accessToken  = jwtUtil.signAccessToken(user);
    const refresh      = jwtUtil.generateRefreshToken();

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refresh.hash, req.get('User-Agent') || null, req.ip, refresh.expiresAt]
    );

    setRefreshCookie(res, refresh.token);
    await auditLog(user.id, 'auth.login', `Login from ${req.ip}`, req.ip);

    // Load freelancer profile if applicable
    let freelancerProfile = null;
    if (user.role === 'freelancer') {
      const { rows: fp } = await query(
        `SELECT freelancer_status, track, skills, availability, assessment_pct,
                assessment_unlocked, queue_position, review_deadline, is_online
         FROM freelancer_profiles WHERE user_id = $1`,
        [user.id]
      );
      if (fp.length) freelancerProfile = fp[0];
    }

    return res.json({
      access_token: accessToken,
      token_type:   'Bearer',
      expires_in:   900, // 15 minutes in seconds
      user: {
        id:             user.id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        account_status: user.account_status,
        email_verified: user.email_verified,
        ...(freelancerProfile && { profile: freelancerProfile }),
      },
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

/**
 * POST /auth/refresh
 * Rotates the refresh token and issues a new access token.
 * Implements refresh token rotation — old token is revoked on use.
 */
async function refresh(req, res) {
  const rawToken = req.cookies?.refreshToken || req.body?.refresh_token;

  if (!rawToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const tokenHash = jwtUtil.hashRefreshToken(rawToken);

    const { rows } = await query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at,
              u.id as uid, u.email, u.role, u.account_status, u.name
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const rt = rows[0];

    if (rt.revoked_at) {
      // Token reuse detected — revoke ALL tokens for this user
      await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1', [rt.user_id]);
      logger.warn('Refresh token reuse detected — all tokens revoked', { userId: rt.user_id });
      return res.status(401).json({ error: 'Refresh token reuse detected. Please log in again.' });
    }

    if (new Date(rt.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired. Please log in again.' });
    }

    if (rt.account_status === 'banned' || rt.account_status === 'suspended') {
      return res.status(403).json({ error: 'Account access restricted' });
    }

    // Rotate: revoke old, issue new
    await transaction(async (client) => {
      await client.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [rt.id]
      );

      const newRefresh = jwtUtil.generateRefreshToken();
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [rt.user_id, newRefresh.hash, req.get('User-Agent'), req.ip, newRefresh.expiresAt]
      );

      setRefreshCookie(res, newRefresh.token);
    });

    const newAccess = jwtUtil.signAccessToken({
      id: rt.uid, email: rt.email, role: rt.role, account_status: rt.account_status,
    });

    return res.json({
      access_token: newAccess,
      token_type:   'Bearer',
      expires_in:   900,
    });
  } catch (err) {
    logger.error('Refresh error', { error: err.message });
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}

/**
 * POST /auth/logout
 * Revokes the current refresh token.
 */
async function logout(req, res) {
  const rawToken = req.cookies?.refreshToken || req.body?.refresh_token;

  if (rawToken) {
    const tokenHash = jwtUtil.hashRefreshToken(rawToken);
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    ).catch(() => {});
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  if (req.user) {
    await auditLog(req.user.id, 'auth.logout', `Logged out from ${req.ip}`, req.ip);
  }

  return res.json({ message: 'Logged out successfully' });
}

/**
 * POST /auth/logout-all
 * Revokes ALL refresh tokens for the authenticated user.
 */
async function logoutAll(req, res) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [req.user.id]
  );
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  await auditLog(req.user.id, 'auth.logout_all', 'All sessions revoked', req.ip);
  return res.json({ message: 'All sessions logged out' });
}

/**
 * GET /auth/verify-email?token=...
 * Validates the email verification token.
 */
async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token required' });

  const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

  try {
    const { rows } = await query(
      `SELECT id, name, email, email_verify_expires
       FROM users
       WHERE email_verify_token = $1 AND email_verified = FALSE`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid or already-used verification link' });
    }

    const user = rows[0];
    if (new Date(user.email_verify_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification link expired. Request a new one.' });
    }

    await query(
      `UPDATE users SET email_verified = TRUE, email_verify_token = NULL,
       email_verify_expires = NULL, account_status = 'active'
       WHERE id = $1`,
      [user.id]
    );

    await auditLog(user.id, 'auth.email_verified', `Email verified: ${user.email}`, req.ip);
    logger.info('Email verified', { userId: user.id });

    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    logger.error('Verify email error', { error: err.message });
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}

/**
 * POST /auth/resend-verification
 * Resends the verification email (rate-limited).
 */
async function resendVerification(req, res) {
  const { email: rawEmail } = req.body;
  if (!rawEmail) return res.status(400).json({ error: 'Email required' });

  const emailLower = rawEmail.trim().toLowerCase();

  const { rows } = await query(
    'SELECT id, name, email, email_verified FROM users WHERE email = $1',
    [emailLower]
  );

  // Always respond 200 to prevent email enumeration
  if (!rows.length || rows[0].email_verified) {
    return res.json({ message: 'If the email exists and is unverified, a new link has been sent.' });
  }

  const user = rows[0];
  const verifyToken = jwtUtil.generateOneTimeToken('24h');

  await query(
    `UPDATE users SET email_verify_token = $1, email_verify_expires = $2 WHERE id = $3`,
    [verifyToken.hash, verifyToken.expiresAt, user.id]
  );

  email.send(user.email, 'verifyEmail', [user.name, verifyToken.token]);

  return res.json({ message: 'Verification email resent. Check your inbox.' });
}

/**
 * POST /auth/forgot-password
 * Sends a password reset link (rate-limited).
 */
async function forgotPassword(req, res) {
  const { email: rawEmail } = req.body;
  const emailLower = rawEmail.trim().toLowerCase();

  try {
    const { rows } = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [emailLower]
    );

    // Always 200 to prevent email enumeration
    if (!rows.length) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const user = rows[0];
    const resetToken = jwtUtil.generateOneTimeToken('1h');

    // Invalidate any existing unused reset tokens for this user
    await query(
      `UPDATE password_reset_tokens SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [user.id]
    );

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken.hash, resetToken.expiresAt]
    );

    email.send(user.email, 'resetPassword', [user.name, resetToken.token]);
    await auditLog(user.id, 'auth.forgot_password', `Reset requested from ${req.ip}`, req.ip);

    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    logger.error('Forgot password error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }
}

/**
 * POST /auth/reset-password
 * Validates reset token and sets new password.
 */
async function resetPassword(req, res) {
  const { token, password } = req.body;

  try {
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { rows } = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, u.name, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1 AND prt.used_at IS NULL`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid or already-used reset link' });
    }

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset link expired. Request a new one.' });
    }

    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await transaction(async (client) => {
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, record.user_id]);
      await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [record.id]);
      // Revoke all refresh tokens — new password = new session
      await client.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1',
        [record.user_id]
      );
    });

    await auditLog(record.user_id, 'auth.password_reset', `Password reset from ${req.ip}`, req.ip);
    logger.info('Password reset', { userId: record.user_id });

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    logger.error('Reset password error', { error: err.message });
    return res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
}

/**
 * POST /auth/change-password
 * Changes password for an authenticated user.
 */
async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  try {
    const { rows } = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await transaction(async (client) => {
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
      await client.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
        [req.user.id]
      );
    });

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    await auditLog(req.user.id, 'auth.change_password', 'Password changed', req.ip);

    return res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    logger.error('Change password error', { error: err.message });
    return res.status(500).json({ error: 'Password change failed' });
  }
}

/**
 * GET /auth/me
 * Returns the currently authenticated user.
 */
async function me(req, res) {
  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.role, u.account_status, u.email_verified,
              u.phone, u.country, u.avatar_url, u.created_at,
              fp.freelancer_status, fp.track, fp.skills, fp.experience,
              fp.availability, fp.bio, fp.portfolio_links, fp.assessment_pct,
              fp.assessment_unlocked, fp.queue_position, fp.review_deadline,
              fp.approved_at, fp.is_online
       FROM users u
       LEFT JOIN freelancer_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    logger.error('Me error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
};
