-- Store per-track assessment statuses for freelancers.
-- Enables listing pending approvals and preventing retakes per track.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS assessment_map JSONB NOT NULL DEFAULT '{}'::jsonb;
