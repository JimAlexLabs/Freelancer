-- Allow authenticated users to read admin/support profile directory rows only.
-- This lets client code resolve admin id/email for notifications safely.

DROP POLICY IF EXISTS "profiles_admin_directory" ON profiles;
CREATE POLICY "profiles_admin_directory"
ON profiles
FOR SELECT
USING (role IN ('admin','support'));
