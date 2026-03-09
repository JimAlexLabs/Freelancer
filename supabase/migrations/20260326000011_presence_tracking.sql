-- Add real-time presence tracking columns to profiles.
-- last_seen: updated every 30s by the frontend heartbeat.
-- current_activity: human-readable string set by the active view
--   e.g. "Taking Assessment", "On Dashboard", "In Messages", etc.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_activity TEXT;

-- Enable Supabase Realtime on profiles so admins can subscribe to presence updates.
-- (Supabase enables replication on all tables by default; this is a safety ensure.)
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Allow users to update their own presence fields (covered by profiles_own).
-- Allow admins/support to read all presence fields (covered by profiles_admin_write).
-- Nothing extra needed — existing RLS policies already cover these new columns.

-- Backfill: set last_seen for currently-active profiles so the admin panel
-- doesn't show all users as offline immediately after deploy.
UPDATE profiles
SET last_seen = NOW() - INTERVAL '10 minutes'
WHERE is_online = true AND last_seen IS NULL;
