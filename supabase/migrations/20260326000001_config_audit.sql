-- Config and audit_log for AfriGig
-- Also adds email to profiles, category to tickets for app compatibility

-- Add email to profiles (denormalized from auth.users for admin queries)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
-- Backfill: not possible to join auth.users from migration; handle_new_user will set it for new users

-- Add category to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Applications: add est_days (app maps cover_letter -> cover column)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS est_days INTEGER;

-- Config: key-value store
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Audit log: for admin actions
CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID REFERENCES auth.users(id),
  action     TEXT NOT NULL,
  details    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Email log: for admin email tracking
CREATE TABLE IF NOT EXISTS email_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "to"       TEXT NOT NULL,
  subject    TEXT,
  body       TEXT,
  status     TEXT DEFAULT 'sent',
  sent_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Only admin can read/write config, audit_log, email_log
DROP POLICY IF EXISTS "config_admin" ON config;
CREATE POLICY "config_admin" ON config FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

DROP POLICY IF EXISTS "audit_admin" ON audit_log;
CREATE POLICY "audit_admin" ON audit_log FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

DROP POLICY IF EXISTS "email_log_admin" ON email_log;
CREATE POLICY "email_log_admin" ON email_log FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','support'));

-- Update trigger to set email on profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = COALESCE(profiles.email, EXCLUDED.email);
  RETURN NEW;
END;
$$;

