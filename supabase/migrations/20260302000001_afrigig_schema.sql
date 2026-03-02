-- AfriGig full schema for Supabase
-- Run: npx supabase db push

-- ─── Enums ────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE freelancer_status AS ENUM (
  'REGISTERED','PROFILE_COMPLETED','ASSESSMENT_PENDING',
  'ASSESSMENT_SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE job_status AS ENUM (
  'draft','open','in_progress','completed','cancelled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE application_status AS ENUM (
  'sent','viewed','shortlisted','accepted','rejected','withdrawn'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ticket_status AS ENUM (
  'open','in_progress','resolved','closed'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM (
  'low','medium','high','urgent'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE escrow_status AS ENUM (
  'initiated','holding','released','refunded','disputed'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Profiles ──────────────────────────────────────────────────
-- Extends Supabase auth.users with AfriGig-specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT,
  role                  TEXT NOT NULL DEFAULT 'freelancer',  -- admin | support | freelancer
  account_status        TEXT NOT NULL DEFAULT 'active',
  country               TEXT,
  phone                 TEXT,
  avatar_url            TEXT,
  freelancer_status     freelancer_status DEFAULT 'REGISTERED',
  track                 TEXT,
  skills                TEXT[],
  experience            TEXT,
  availability          TEXT,
  bio                   TEXT,
  portfolio_links       TEXT[],
  cv_url                TEXT,
  assessment_unlocked   BOOLEAN DEFAULT FALSE,
  assessment_fee_paid   BOOLEAN DEFAULT FALSE,
  assessment_score      INTEGER,
  assessment_max        INTEGER,
  assessment_pct        NUMERIC(5,2),
  assessment_submitted_at TIMESTAMPTZ,
  rejection_reason      TEXT,
  queue_position        INTEGER,
  review_deadline       TIMESTAMPTZ,
  approved_at           TIMESTAMPTZ,
  is_online             BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_freelancer_status ON profiles(freelancer_status);

-- ─── Jobs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  skills        TEXT[],
  budget_min    NUMERIC(12,2),
  budget_max    NUMERIC(12,2),
  duration_days INTEGER,
  status        job_status DEFAULT 'open',
  payment_status TEXT DEFAULT 'unpaid',
  created_by    UUID REFERENCES auth.users(id),
  assigned_to   UUID REFERENCES auth.users(id),
  progress      INTEGER DEFAULT 0,
  apps_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);

-- ─── Applications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover       TEXT,
  bid_amount  NUMERIC(12,2),
  status      application_status DEFAULT 'sent',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_apps_job_id  ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON applications(user_id);

-- ─── Conversations & Messages ───────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  last_message TEXT,
  last_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convo_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  body      TEXT NOT NULL,
  read      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_convo_id ON messages(convo_id);

-- ─── Tickets ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      ticket_status DEFAULT 'open',
  priority    ticket_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status  ON tickets(status);

-- ─── Wallets & Transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance    NUMERIC(14,2) DEFAULT 0,
  currency   TEXT DEFAULT 'KES',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id    UUID NOT NULL REFERENCES wallets(id),
  type         TEXT NOT NULL,
  entry_type   TEXT NOT NULL,   -- credit | debit
  amount       NUMERIC(14,2) NOT NULL,
  currency     TEXT DEFAULT 'KES',
  status       TEXT DEFAULT 'completed',
  reference    TEXT,
  meta         JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Escrow ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrows (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id     UUID NOT NULL REFERENCES jobs(id),
  amount     NUMERIC(14,2) NOT NULL,
  status     escrow_status DEFAULT 'holding',
  reference  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT,
  title      TEXT,
  message    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user_id ON notifications(user_id);

-- ─── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS: enable on all tables ────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ─────────────────────────────────────────────
-- (DROP existing to make idempotent, then re-create)

-- Profiles
DROP POLICY IF EXISTS "profiles_own"        ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_own"        ON profiles FOR ALL     USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Jobs
DROP POLICY IF EXISTS "jobs_public_read" ON jobs;
DROP POLICY IF EXISTS "jobs_admin_write" ON jobs;
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_admin_write" ON jobs FOR ALL    USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Applications
DROP POLICY IF EXISTS "apps_own"        ON applications;
DROP POLICY IF EXISTS "apps_admin_read" ON applications;
CREATE POLICY "apps_own"        ON applications FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "apps_admin_read" ON applications FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Conversations
DROP POLICY IF EXISTS "convos_participant" ON conversations;
CREATE POLICY "convos_participant" ON conversations FOR ALL USING (auth.uid() = ANY(participants));

-- Messages
DROP POLICY IF EXISTS "messages_participant" ON messages;
CREATE POLICY "messages_participant" ON messages FOR ALL
  USING (EXISTS (SELECT 1 FROM conversations WHERE id = convo_id AND auth.uid() = ANY(participants)));

-- Tickets
DROP POLICY IF EXISTS "tickets_own"   ON tickets;
DROP POLICY IF EXISTS "tickets_admin" ON tickets;
CREATE POLICY "tickets_own"   ON tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tickets_admin" ON tickets FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Ticket replies
DROP POLICY IF EXISTS "replies_own"   ON ticket_replies;
DROP POLICY IF EXISTS "replies_admin" ON ticket_replies;
CREATE POLICY "replies_own"   ON ticket_replies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "replies_admin" ON ticket_replies FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Wallets
DROP POLICY IF EXISTS "wallets_own"   ON wallets;
DROP POLICY IF EXISTS "wallets_admin" ON wallets;
CREATE POLICY "wallets_own"   ON wallets FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "wallets_admin" ON wallets FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Transactions
DROP POLICY IF EXISTS "txn_own"   ON transactions;
DROP POLICY IF EXISTS "txn_admin" ON transactions;
CREATE POLICY "txn_own"   ON transactions FOR SELECT USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));
CREATE POLICY "txn_admin" ON transactions FOR ALL    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Notifications
DROP POLICY IF EXISTS "notifs_own" ON notifications;
CREATE POLICY "notifs_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Escrows
DROP POLICY IF EXISTS "escrows_admin" ON escrows;
CREATE POLICY "escrows_admin" ON escrows FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));
