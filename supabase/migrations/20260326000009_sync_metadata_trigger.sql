-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: Sync auth.users.raw_user_meta_data → public.profiles automatically.
--
-- Root cause: ApiUsers.updateProfile() (supabase.auth.updateUser) updates
-- user_metadata, but the profiles table is only updated by db.patch() which
-- can silently fail. Admin reads profiles table only, so it always showed stale
-- "REGISTERED" status and null track for real users.
--
-- Three parts:
--   1. A SECURITY DEFINER function that safely copies key fields from metadata
--      into profiles whenever metadata changes.
--   2. A trigger on auth.users that fires on every raw_user_meta_data UPDATE.
--   3. A DO block that immediately backfills ALL existing users right now.
-- ─────────────────────────────────────────────────────────────────────────────

-- Part 1: Sync function
CREATE OR REPLACE FUNCTION sync_metadata_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  meta     JSONB := NEW.raw_user_meta_data;
  old_meta JSONB := OLD.raw_user_meta_data;
  fs_text  TEXT;
  fs_enum  freelancer_status;
BEGIN
  -- Short-circuit if metadata is unchanged
  IF meta IS NOT DISTINCT FROM old_meta THEN
    RETURN NEW;
  END IF;

  -- Extract freelancer_status (safely cast to enum)
  fs_text := meta->>'freelancer_status';
  IF fs_text IS NOT NULL AND fs_text <> '' THEN
    BEGIN
      fs_enum := fs_text::freelancer_status;
    EXCEPTION WHEN invalid_text_representation THEN
      fs_enum := NULL;
    END;
  ELSE
    fs_enum := NULL;
  END IF;

  UPDATE public.profiles SET
    -- Only overwrite if new metadata has a non-null value
    freelancer_status = CASE
      WHEN fs_enum IS NOT NULL THEN fs_enum
      ELSE freelancer_status
    END,
    track = CASE
      WHEN meta->>'track' IS NOT NULL AND meta->>'track' <> '' THEN meta->>'track'
      ELSE track
    END,
    assessment_pct = CASE
      WHEN meta->>'assessment_pct' IS NOT NULL THEN (meta->>'assessment_pct')::numeric
      ELSE assessment_pct
    END,
    assessment_unlocked = CASE
      WHEN meta->>'assessment_unlocked' IS NOT NULL THEN (meta->>'assessment_unlocked')::boolean
      ELSE assessment_unlocked
    END,
    assessment_map = CASE
      WHEN meta->'assessment_map' IS NOT NULL AND meta->'assessment_map' <> 'null'::jsonb AND meta->'assessment_map' <> '{}'::jsonb
        THEN meta->'assessment_map'
      ELSE assessment_map
    END,
    queue_position = CASE
      WHEN meta->>'queue_position' IS NOT NULL THEN (meta->>'queue_position')::integer
      ELSE queue_position
    END,
    review_deadline = CASE
      WHEN meta->>'review_deadline' IS NOT NULL THEN (meta->>'review_deadline')::timestamptz
      ELSE review_deadline
    END,
    assessment_submitted_at = CASE
      WHEN meta->>'assessment_submitted_at' IS NOT NULL THEN (meta->>'assessment_submitted_at')::timestamptz
      ELSE assessment_submitted_at
    END,
    -- Also sync profile fields if present in metadata
    skills = CASE
      WHEN meta->'skills' IS NOT NULL AND jsonb_typeof(meta->'skills') = 'array' THEN
        ARRAY(SELECT jsonb_array_elements_text(meta->'skills'))
      WHEN meta->>'skills' IS NOT NULL AND meta->>'skills' <> '' THEN
        string_to_array(meta->>'skills', ',')
      ELSE skills
    END,
    experience = CASE
      WHEN meta->>'experience' IS NOT NULL AND meta->>'experience' <> '' THEN meta->>'experience'
      ELSE experience
    END,
    bio = CASE
      WHEN meta->>'bio' IS NOT NULL AND meta->>'bio' <> '' THEN meta->>'bio'
      ELSE bio
    END,
    country = CASE
      WHEN meta->>'country' IS NOT NULL AND meta->>'country' <> '' THEN meta->>'country'
      ELSE country
    END,
    availability = CASE
      WHEN meta->>'availability' IS NOT NULL AND meta->>'availability' <> '' THEN meta->>'availability'
      ELSE availability
    END,
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Part 2: Trigger on auth.users
DROP TRIGGER IF EXISTS on_user_metadata_updated ON auth.users;
CREATE TRIGGER on_user_metadata_updated
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_metadata_to_profile();

-- Part 3: Backfill ALL existing users immediately
-- This fixes every user who went through onboarding before this trigger existed.
DO $$
DECLARE
  u       RECORD;
  meta    JSONB;
  fs_text TEXT;
  fs_enum freelancer_status;
  synced  INTEGER := 0;
BEGIN
  FOR u IN SELECT id, raw_user_meta_data FROM auth.users LOOP
    meta := u.raw_user_meta_data;
    IF meta IS NULL OR meta = '{}'::jsonb THEN CONTINUE; END IF;

    fs_text := meta->>'freelancer_status';
    fs_enum := NULL;
    IF fs_text IS NOT NULL AND fs_text <> '' THEN
      BEGIN
        fs_enum := fs_text::freelancer_status;
      EXCEPTION WHEN invalid_text_representation THEN
        fs_enum := NULL;
      END;
    END IF;

    UPDATE public.profiles SET
      freelancer_status = CASE WHEN fs_enum IS NOT NULL THEN fs_enum ELSE freelancer_status END,
      track             = CASE WHEN meta->>'track' IS NOT NULL AND meta->>'track' <> '' THEN meta->>'track' ELSE track END,
      assessment_pct    = CASE WHEN meta->>'assessment_pct' IS NOT NULL THEN (meta->>'assessment_pct')::numeric ELSE assessment_pct END,
      assessment_unlocked = CASE WHEN meta->>'assessment_unlocked' IS NOT NULL THEN (meta->>'assessment_unlocked')::boolean ELSE assessment_unlocked END,
      assessment_map    = CASE
        WHEN meta->'assessment_map' IS NOT NULL AND meta->'assessment_map' <> 'null'::jsonb AND meta->'assessment_map' <> '{}'::jsonb
          THEN meta->'assessment_map'
        ELSE assessment_map
      END,
      queue_position    = CASE WHEN meta->>'queue_position' IS NOT NULL THEN (meta->>'queue_position')::integer ELSE queue_position END,
      review_deadline   = CASE WHEN meta->>'review_deadline' IS NOT NULL THEN (meta->>'review_deadline')::timestamptz ELSE review_deadline END,
      assessment_submitted_at = CASE WHEN meta->>'assessment_submitted_at' IS NOT NULL THEN (meta->>'assessment_submitted_at')::timestamptz ELSE assessment_submitted_at END,
      skills            = CASE
        WHEN meta->'skills' IS NOT NULL AND jsonb_typeof(meta->'skills') = 'array' THEN
          ARRAY(SELECT jsonb_array_elements_text(meta->'skills'))
        WHEN meta->>'skills' IS NOT NULL AND meta->>'skills' <> '' THEN
          string_to_array(meta->>'skills', ',')
        ELSE skills
      END,
      experience        = CASE WHEN meta->>'experience' IS NOT NULL AND meta->>'experience' <> '' THEN meta->>'experience' ELSE experience END,
      bio               = CASE WHEN meta->>'bio' IS NOT NULL AND meta->>'bio' <> '' THEN meta->>'bio' ELSE bio END,
      country           = CASE WHEN meta->>'country' IS NOT NULL AND meta->>'country' <> '' THEN meta->>'country' ELSE country END,
      availability      = CASE WHEN meta->>'availability' IS NOT NULL AND meta->>'availability' <> '' THEN meta->>'availability' ELSE availability END,
      updated_at        = NOW()
    WHERE id = u.id;

    synced := synced + 1;
  END LOOP;

  RAISE NOTICE 'Backfilled % user profiles from auth metadata.', synced;
END;
$$;
