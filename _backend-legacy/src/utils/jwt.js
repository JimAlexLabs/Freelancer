// src/utils/jwt.js
// Handles access tokens (short-lived) and refresh tokens (long-lived)
// Access tokens are signed JWTs.
// Refresh tokens are random opaque strings stored hashed in the DB.

const jwt  = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'dev_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod';
const ACCESS_TTL     = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_TTL    = process.env.JWT_REFRESH_EXPIRES || '30d';

/**
 * Sign a short-lived access JWT.
 * Payload includes: id, email, role, account_status
 */
function signAccessToken(user) {
  return jwt.sign(
    {
      sub:            user.id,
      email:          user.email,
      role:           user.role,
      account_status: user.account_status,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL, issuer: 'afrigig', audience: 'afrigig-api' }
  );
}

/**
 * Verify an access JWT.
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: 'afrigig',
    audience: 'afrigig-api',
  });
}

/**
 * Generate a secure random refresh token (opaque).
 * Returns { token, hash, expiresAt }
 */
function generateRefreshToken() {
  const token     = crypto.randomBytes(48).toString('hex'); // 96 chars
  const hash      = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + parseDuration(REFRESH_TTL));
  return { token, hash, expiresAt };
}

/**
 * Hash a raw refresh token for DB storage/lookup.
 */
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a secure one-time token for email verification or password reset.
 * Returns { token, hash, expiresAt }
 */
function generateOneTimeToken(ttl = '24h') {
  const token     = crypto.randomBytes(32).toString('hex'); // 64 chars
  const hash      = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + parseDuration(ttl));
  return { token, hash, expiresAt };
}

/**
 * Parse duration strings like '15m', '1h', '30d' to milliseconds.
 */
function parseDuration(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration: ${str}`);
  return parseInt(match[1]) * units[match[2]];
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateOneTimeToken,
  parseDuration,
};
