// src/middleware/auth.middleware.js

const { verifyAccessToken } = require('../utils/jwt');
const { query }              = require('../db/pool');
const logger                 = require('../utils/logger');

/**
 * requireAuth
 * Validates the Bearer access token on every protected route.
 * Attaches req.user = { id, email, role, account_status }
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token   = header.slice(7);
    const payload = verifyAccessToken(token);

    // Re-check user still exists and is not banned
    // (extra DB hit but catches real-time bans/suspensions)
    const { rows } = await query(
      `SELECT id, email, role, account_status FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];
    if (user.account_status === 'banned') {
      return res.status(403).json({ error: 'Account banned. Contact support@afrigig.com' });
    }
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    logger.error('Auth middleware error', { error: err.message });
    return res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * requireRole(...roles)
 * Must come after requireAuth.
 * Usage: router.get('/admin', requireAuth, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}

/**
 * requireEmailVerified
 * Rejects requests from users who haven't verified their email.
 * Must come after requireAuth.
 */
async function requireEmailVerified(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const { rows } = await query(
    'SELECT email_verified FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!rows[0]?.email_verified) {
    return res.status(403).json({
      error: 'Email not verified. Check your inbox for the verification link.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
}

/**
 * optionalAuth
 * Attaches req.user if a valid token is present, but never rejects.
 * Useful for public endpoints that behave differently when logged in.
 */
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const payload = verifyAccessToken(header.slice(7));
      const { rows } = await query(
        'SELECT id, email, role, account_status FROM users WHERE id = $1',
        [payload.sub]
      );
      if (rows.length) req.user = rows[0];
    }
  } catch (_) {
    // Silently ignore invalid/expired tokens for optional auth
  }
  next();
}

module.exports = { requireAuth, requireRole, requireEmailVerified, optionalAuth };
