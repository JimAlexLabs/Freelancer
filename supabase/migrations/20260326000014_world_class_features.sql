-- =============================================================================
-- AfriGig World-Class Features Migration
-- Phase P0-P3: Milestones, Reviews, KYC, Referrals, Subscriptions,
--              Bidding enhancements, Withdrawals, Announcements
-- =============================================================================

-- ─── 1. PROFILES — add missing fields ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tos_agreed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tos_version          TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS subscription_tier    TEXT DEFAULT 'free', -- free|pro|elite
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bids_used_this_month  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bids_reset_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referral_code         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by           UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS total_earned          NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS jobs_completed        INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating        NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS total_reviews         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kyc_status            TEXT DEFAULT 'none', -- none|pending|approved|rejected
  ADD COLUMN IF NOT EXISTS kyc_id_url            TEXT,
  ADD COLUMN IF NOT EXISTS kyc_selfie_url        TEXT,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_by       UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS withdrawal_limit      NUMERIC DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS cv_url                TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url            TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_files       JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS public_profile_slug   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_featured           BOOLEAN DEFAULT FALSE;

-- ─── 2. JOBS — add milestone & instant hire fields ─────────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS has_milestones        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS instant_hire_budget   NUMERIC,
  ADD COLUMN IF NOT EXISTS urgent                BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS visibility            TEXT DEFAULT 'public', -- public|invite_only
  ADD COLUMN IF NOT EXISTS featured              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deadline_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS views_count           INTEGER DEFAULT 0;

-- ─── 3. APPLICATIONS — bid enhancements ────────────────────────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS counter_offer         NUMERIC,
  ADD COLUMN IF NOT EXISTS counter_message       TEXT,
  ADD COLUMN IF NOT EXISTS bid_expires_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_boosted            BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS boosted_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS milestone_plan        JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS withdrawn_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shortlisted_at        TIMESTAMPTZ;

-- ─── 4. MILESTONES TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES applications(id),
  freelancer_id   UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  amount          NUMERIC NOT NULL,
  escrow_id       UUID REFERENCES escrows(id),
  due_date        DATE,
  order_index     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending', -- pending|in_progress|submitted|approved|disputed|rejected
  deliverable_url TEXT,
  deliverable_note TEXT,
  submitted_at    TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_job_id ON milestones(job_id);
CREATE INDEX IF NOT EXISTS idx_milestones_freelancer ON milestones(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

-- RLS for milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_freelancer_own" ON milestones
  FOR SELECT USING (freelancer_id = auth.uid());

CREATE POLICY "milestones_admin_all" ON milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','support'))
  );

CREATE POLICY "milestones_freelancer_update" ON milestones
  FOR UPDATE USING (freelancer_id = auth.uid());

-- ─── 5. REVIEWS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES profiles(id), -- admin who reviews
  freelancer_id   UUID NOT NULL REFERENCES profiles(id),
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  quality_score   INTEGER CHECK (quality_score BETWEEN 1 AND 5),
  communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
  timeliness_score INTEGER CHECK (timeliness_score BETWEEN 1 AND 5),
  comment         TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_freelancer ON reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','support'))
  );

-- ─── 6. REFERRALS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES profiles(id),
  referred_id     UUID NOT NULL REFERENCES profiles(id),
  status          TEXT DEFAULT 'pending', -- pending|rewarded|cancelled
  reward_amount   NUMERIC DEFAULT 200,
  rewarded_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id) -- each new user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_own" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "referrals_admin" ON referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 7. SUBSCRIPTIONS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  tier            TEXT NOT NULL, -- pro|elite
  amount_kes      NUMERIC NOT NULL,
  status          TEXT DEFAULT 'active', -- active|cancelled|expired
  starts_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  payment_ref     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 8. WITHDRAWALS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  amount          NUMERIC NOT NULL,
  fee             NUMERIC NOT NULL DEFAULT 0,
  net_amount      NUMERIC NOT NULL, -- amount - fee
  phone           TEXT NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending|processing|completed|failed|rejected
  method          TEXT DEFAULT 'mpesa_b2c',
  reference       TEXT UNIQUE,
  conversation_id TEXT, -- Daraja B2C ConversationID
  notes           TEXT,
  approved_by     UUID REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "withdrawals_own" ON withdrawals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "withdrawals_own_insert" ON withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "withdrawals_admin" ON withdrawals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','support'))
  );

-- ─── 9. ANNOUNCEMENTS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT DEFAULT 'info', -- info|warning|success|urgent
  target_role     TEXT DEFAULT 'all', -- all|freelancer|support
  is_active       BOOLEAN DEFAULT TRUE,
  expires_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_read_all" ON announcements
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "announcements_admin" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 10. PROMO CODES TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT DEFAULT 'percent', -- percent|fixed
  discount_value  NUMERIC NOT NULL,
  applies_to      TEXT DEFAULT 'assessment', -- assessment|subscription|all
  max_uses        INTEGER DEFAULT 100,
  uses_count      INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promo_codes_read" ON promo_codes
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "promo_codes_admin" ON promo_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 11. FILE RECORDS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS file_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  type            TEXT NOT NULL, -- cv|kyc_id|kyc_selfie|portfolio|milestone_deliverable|avatar
  bucket          TEXT NOT NULL,
  path            TEXT NOT NULL,
  url             TEXT,
  original_name   TEXT,
  size_bytes      INTEGER,
  mime_type       TEXT,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_records_user ON file_records(user_id);
CREATE INDEX IF NOT EXISTS idx_file_records_type ON file_records(type);

ALTER TABLE file_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_own" ON file_records
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "files_admin" ON file_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','support'))
  );

-- ─── 12. DISPUTE RESOLUTIONS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispute_resolutions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID REFERENCES tickets(id),
  job_id          UUID REFERENCES jobs(id),
  freelancer_id   UUID REFERENCES profiles(id),
  raised_by       UUID REFERENCES profiles(id),
  amount_disputed NUMERIC,
  ruling          TEXT, -- freelancer_wins|client_wins|split|dismissed
  ruling_amount   NUMERIC,
  arbitration_fee NUMERIC DEFAULT 0,
  notes           TEXT,
  resolved_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disputes_involved" ON dispute_resolutions
  FOR SELECT USING (
    freelancer_id = auth.uid() OR raised_by = auth.uid()
  );

CREATE POLICY "disputes_admin" ON dispute_resolutions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','support'))
  );

-- ─── 13. GENERATE REFERRAL CODES ───────────────────────────────────────────
-- Auto-generate referral code for approved freelancers who don't have one
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.freelancer_status = 'APPROVED' AND OLD.freelancer_status != 'APPROVED' AND NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_freelancer_approved ON profiles;
CREATE TRIGGER on_freelancer_approved
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- ─── 14. UPDATE FREELANCER STATS ON REVIEW ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  total_reviews INTEGER;
BEGIN
  SELECT
    AVG(rating)::NUMERIC(3,2),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM reviews
  WHERE freelancer_id = NEW.freelancer_id;

  UPDATE profiles
  SET
    average_rating = avg_rating,
    total_reviews = total_reviews,
    updated_at = NOW()
  WHERE id = NEW.freelancer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_freelancer_rating();

-- ─── 15. REALTIME — enable for new tables ──────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;

-- ─── 16. CONFIG — add new platform settings ────────────────────────────────
INSERT INTO config (key, value) VALUES
  ('subscription_plans', '{
    "pro":   {"price_kes": 999,  "bids_per_month": 20, "label": "Pro",   "features": ["20 bids/month", "Highlighted profile", "Priority applications"]},
    "elite": {"price_kes": 2499, "bids_per_month": 999, "label": "Elite", "features": ["Unlimited bids", "Top Rated badge", "Faster payout priority"]}
  }'::jsonb),
  ('withdrawal_settings', '{
    "min_amount": 500,
    "max_auto_approve": 10000,
    "fee_percent": 2,
    "fee_min_kes": 50,
    "processing_hours": 72
  }'::jsonb),
  ('bid_limits', '{
    "free":  5,
    "pro":   20,
    "elite": 999
  }'::jsonb),
  ('referral_reward_kes', '200'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ─── 17. KYC WITHDRAWAL LIMIT UPDATE ───────────────────────────────────────
-- Set withdrawal limits based on KYC status
UPDATE profiles SET withdrawal_limit = 10000 WHERE kyc_status = 'approved';
UPDATE profiles SET withdrawal_limit = 1000  WHERE kyc_status != 'approved';
