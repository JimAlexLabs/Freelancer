-- Allow admin and support to update/insert/delete ANY profile row.
-- Without this policy, admin approve/reject/suspend actions silently fail
-- because the only write policy (profiles_own) only allows users to edit their own profile.

DROP POLICY IF EXISTS "profiles_admin_write" ON profiles;
CREATE POLICY "profiles_admin_write"
ON profiles
FOR ALL
USING      ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Also ensure the admin-read policy is present (idempotent re-apply)
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read"
ON profiles
FOR SELECT
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));
