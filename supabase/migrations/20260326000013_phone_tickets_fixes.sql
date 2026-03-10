-- Phone number on profiles (for M-Pesa withdrawals and KYC)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS kyc_id_uploaded   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_selfie_done   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kyc_phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS video_intro_url TEXT,
  ADD COLUMN IF NOT EXISTS skill_showcase_json JSONB;

-- Tickets: add category and sla_deadline (these were being set by the app but the columns didn't exist,
-- causing every freelancer ticket submission to fail silently with a 400 error)
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS category     TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;

-- Index for faster ticket category queries
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
