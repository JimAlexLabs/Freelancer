// src/db/migrate.js
// Run with: npm run migrate
// Idempotent — safe to run multiple times (uses IF NOT EXISTS)

require('dotenv').config();
const { pool } = require('./pool');
const logger = require('../utils/logger');

const migrations = [

  // ── 001: Extensions ─────────────────────────────────────────
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
  `CREATE EXTENSION IF NOT EXISTS "unaccent"`,

  // ── 002: Enums ───────────────────────────────────────────────
  `DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'support', 'freelancer', 'client');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE freelancer_status AS ENUM (
      'REGISTERED', 'PROFILE_COMPLETED', 'ASSESSMENT_PENDING',
      'ASSESSMENT_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'pending', 'suspended', 'banned');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('sent', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('initiated', 'holding', 'released', 'refunded', 'disputed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // ── 003: Users ───────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  VARCHAR(120)  NOT NULL,
    email                 VARCHAR(255)  NOT NULL UNIQUE,
    password_hash         VARCHAR(255)  NOT NULL,
    role                  user_role     NOT NULL DEFAULT 'freelancer',
    account_status        account_status NOT NULL DEFAULT 'pending',
    email_verified        BOOLEAN       NOT NULL DEFAULT FALSE,
    email_verify_token    VARCHAR(255),
    email_verify_expires  TIMESTAMPTZ,
    phone                 VARCHAR(30),
    country               VARCHAR(80),
    avatar_url            TEXT,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role)`,

  // ── 004: Refresh Tokens ──────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    user_agent  TEXT,
    ip_address  VARCHAR(45),
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_rt_user_id    ON refresh_tokens(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_rt_token_hash ON refresh_tokens(token_hash)`,

  // ── 005: Password Reset Tokens ───────────────────────────────
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  // ── 006: Freelancer Profiles ─────────────────────────────────
  `CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID           NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    freelancer_status        freelancer_status NOT NULL DEFAULT 'REGISTERED',
    track                    VARCHAR(50),
    skills                   TEXT[],
    experience               TEXT,
    availability             VARCHAR(50),
    bio                      TEXT,
    portfolio_links          TEXT[],
    hourly_rate              NUMERIC(10,2),
    cv_url                   TEXT,
    assessment_unlocked      BOOLEAN        NOT NULL DEFAULT FALSE,
    assessment_fee_paid      BOOLEAN        NOT NULL DEFAULT FALSE,
    assessment_fee_ref       VARCHAR(120),
    assessment_score         INTEGER,
    assessment_max           INTEGER,
    assessment_pct           NUMERIC(5,2),
    assessment_submitted_at  TIMESTAMPTZ,
    rejection_reason         TEXT,
    queue_position           INTEGER,
    review_deadline          TIMESTAMPTZ,
    approved_at              TIMESTAMPTZ,
    is_online                BOOLEAN        NOT NULL DEFAULT FALSE,
    last_seen_at             TIMESTAMPTZ,
    created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_fp_user_id ON freelancer_profiles(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_fp_status  ON freelancer_profiles(freelancer_status)`,
  `CREATE INDEX IF NOT EXISTS idx_fp_track   ON freelancer_profiles(track)`,

  // ── 007: Jobs ────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by      UUID         NOT NULL REFERENCES users(id),
    assigned_to     UUID         REFERENCES users(id),
    title           VARCHAR(200) NOT NULL,
    description     TEXT         NOT NULL,
    category        VARCHAR(100) NOT NULL,
    skills_required TEXT[]       NOT NULL DEFAULT '{}',
    budget_min      NUMERIC(12,2),
    budget_max      NUMERIC(12,2) NOT NULL,
    duration_days   INTEGER,
    status          job_status   NOT NULL DEFAULT 'open',
    payment_status  VARCHAR(50)  NOT NULL DEFAULT 'unpaid',
    escrow_amount   NUMERIC(12,2),
    progress        INTEGER      NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    apps_count      INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs(status)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_category   ON jobs(category)`,

  // Full-text search index on jobs
  `CREATE INDEX IF NOT EXISTS idx_jobs_fts ON jobs
    USING gin(to_tsvector('english', title || ' ' || description))`,

  // ── 008: Applications ────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS applications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id        UUID               NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id       UUID               NOT NULL REFERENCES users(id),
    cover_letter  TEXT               NOT NULL,
    bid_amount    NUMERIC(12,2)      NOT NULL,
    est_days      INTEGER            NOT NULL,
    status        application_status NOT NULL DEFAULT 'sent',
    created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, user_id)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_apps_job_id  ON applications(job_id)`,
  `CREATE INDEX IF NOT EXISTS idx_apps_user_id ON applications(user_id)`,

  // ── 009: Assessment Attempts ─────────────────────────────────
  `CREATE TABLE IF NOT EXISTS assessment_attempts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users(id),
    track             VARCHAR(50)  NOT NULL,
    section           VARCHAR(80)  NOT NULL,
    answers           JSONB        NOT NULL DEFAULT '{}',
    score             INTEGER      NOT NULL DEFAULT 0,
    max_score         INTEGER      NOT NULL DEFAULT 0,
    time_taken_secs   INTEGER,
    status            VARCHAR(30)  NOT NULL DEFAULT 'in_progress',
    started_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    submitted_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_aa_user_id ON assessment_attempts(user_id)`,

  // ── 010: Wallets ─────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS wallets (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID           NOT NULL UNIQUE REFERENCES users(id),
    currency   VARCHAR(5)     NOT NULL DEFAULT 'KES',
    balance    NUMERIC(15,2)  NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  )`,

  // ── 011: Transactions ────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id   UUID          NOT NULL REFERENCES wallets(id),
    type        VARCHAR(60)   NOT NULL,
    entry_type  VARCHAR(10)   NOT NULL CHECK (entry_type IN ('credit','debit')),
    amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency    VARCHAR(5)    NOT NULL DEFAULT 'KES',
    status      VARCHAR(30)   NOT NULL DEFAULT 'completed',
    reference   VARCHAR(120)  NOT NULL UNIQUE,
    meta        JSONB         NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_txn_wallet_id ON transactions(wallet_id)`,
  `CREATE INDEX IF NOT EXISTS idx_txn_reference  ON transactions(reference)`,

  // ── 012: Escrows ─────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS escrows (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      UUID          NOT NULL REFERENCES jobs(id),
    amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status      escrow_status NOT NULL DEFAULT 'initiated',
    reference   VARCHAR(120)  NOT NULL UNIQUE,
    released_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  )`,

  // ── 013: Messages ────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS conversations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants UUID[]       NOT NULL,
    last_message TEXT,
    last_msg_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convo_id     UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id    UUID         NOT NULL REFERENCES users(id),
    recipient_id UUID         NOT NULL REFERENCES users(id),
    body         TEXT         NOT NULL,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_msgs_convo_id ON messages(convo_id)`,
  `CREATE INDEX IF NOT EXISTS idx_msgs_sender   ON messages(sender_id)`,

  // ── 014: Support Tickets ─────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS tickets (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID            NOT NULL REFERENCES users(id),
    subject     VARCHAR(300)    NOT NULL,
    message     TEXT            NOT NULL,
    status      ticket_status   NOT NULL DEFAULT 'open',
    priority    ticket_priority NOT NULL DEFAULT 'medium',
    category    VARCHAR(80),
    assigned_to UUID            REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS ticket_replies (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    from_user  UUID        NOT NULL REFERENCES users(id),
    body       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_status  ON tickets(status)`,

  // ── 015: Notifications ───────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(80)  NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    meta       JSONB        NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_notif_user_id ON notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notif_is_read ON notifications(user_id, is_read)`,

  // ── 016: Email Log ───────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS email_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email   VARCHAR(255) NOT NULL,
    subject    VARCHAR(500) NOT NULL,
    template   VARCHAR(80),
    status     VARCHAR(30)  NOT NULL DEFAULT 'sent',
    error      TEXT,
    sent_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  // ── 017: Audit Log ───────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS audit_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         REFERENCES users(id),
    action     VARCHAR(120) NOT NULL,
    description TEXT        NOT NULL,
    ip_address VARCHAR(45),
    meta       JSONB        NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_action  ON audit_log(action)`,

  // ── 018: Platform Config ─────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS platform_config (
    key        VARCHAR(120) PRIMARY KEY,
    value      JSONB        NOT NULL,
    updated_by UUID         REFERENCES users(id),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`,

  // ── 019: updated_at auto-trigger ─────────────────────────────
  `CREATE OR REPLACE FUNCTION set_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $$ LANGUAGE plpgsql`,

  ...[
    'users','freelancer_profiles','jobs','applications',
    'wallets','escrows','tickets'
  ].map(t => `
    DROP TRIGGER IF EXISTS trg_${t}_updated_at ON ${t};
    CREATE TRIGGER trg_${t}_updated_at
      BEFORE UPDATE ON ${t}
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `),
];

async function migrate() {
  const client = await pool.connect();
  try {
    logger.info('Running migrations…');
    for (const sql of migrations) {
      await client.query(sql);
    }
    logger.info(`✅ ${migrations.length} migration steps completed`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  logger.error('Migration failed', { error: err.message });
  process.exit(1);
});
