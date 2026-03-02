-- Allow anyone to read platform config (assessment fees, etc.); only admin can write
DROP POLICY IF EXISTS "config_public_read" ON config;
CREATE POLICY "config_public_read" ON config FOR SELECT USING (true);
