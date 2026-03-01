// src/db/pool.js
// Singleton PostgreSQL connection pool
// Uses pg.Pool for connection reuse across requests

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Prefer DATABASE_URL (e.g. Supabase connection string); otherwise use DB_* vars
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'afrigig',
      user:     process.env.DB_USER     || 'afrigig_user',
      password: process.env.DB_PASSWORD || '',
      ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max:      20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(connectionConfig);

// Log pool events in development
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

/**
 * Execute a parameterised query.
 * @param {string} text   — SQL with $1, $2 placeholders
 * @param {Array}  params — Bound parameters
 * @returns {Promise<pg.QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      logger.debug('DB query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    logger.error('DB query error', { text: text.slice(0, 80), error: err.message });
    throw err;
  }
}

/**
 * Execute multiple queries in a single transaction.
 * Automatically ROLLBACK on any error.
 * @param {Function} fn — async (client) => { ... }
 */
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Health-check: verify DB is reachable */
async function ping() {
  const res = await query('SELECT NOW() AS now');
  return res.rows[0].now;
}

module.exports = { query, transaction, ping, pool };
