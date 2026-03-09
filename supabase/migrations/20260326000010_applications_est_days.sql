-- Add est_days to applications table (was missing from original schema,
-- causing silent insert failures when freelancers submitted proposals).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS est_days INTEGER;
