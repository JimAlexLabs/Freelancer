-- Enable Supabase Realtime on the profiles table.
-- Without this, postgres_changes subscriptions receive NO events from this table.
-- Also wire in notifications so unread-count badge updates in real-time.

-- Add to the Supabase managed publication (idempotent via DO block)
DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  -- notifications (for real-time unread badge)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;

-- REPLICA IDENTITY FULL ensures the full old+new row is sent in change events,
-- so the Realtime payload contains all fields (not just changed ones).
ALTER TABLE profiles       REPLICA IDENTITY FULL;
ALTER TABLE notifications  REPLICA IDENTITY FULL;
