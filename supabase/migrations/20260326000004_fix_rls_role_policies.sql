-- Fix RLS recursion / 500s caused by policies that query profiles inside profiles policy paths.
-- Use auth JWT metadata role directly for admin/support checks.

-- Profiles
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read"
ON profiles
FOR SELECT
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Jobs
DROP POLICY IF EXISTS "jobs_admin_write" ON jobs;
CREATE POLICY "jobs_admin_write"
ON jobs
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Applications
DROP POLICY IF EXISTS "apps_admin_read" ON applications;
CREATE POLICY "apps_admin_read"
ON applications
FOR SELECT
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Tickets
DROP POLICY IF EXISTS "tickets_admin" ON tickets;
CREATE POLICY "tickets_admin"
ON tickets
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Ticket replies
DROP POLICY IF EXISTS "replies_admin" ON ticket_replies;
CREATE POLICY "replies_admin"
ON ticket_replies
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Wallets
DROP POLICY IF EXISTS "wallets_admin" ON wallets;
CREATE POLICY "wallets_admin"
ON wallets
FOR SELECT
USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Transactions
DROP POLICY IF EXISTS "txn_admin" ON transactions;
CREATE POLICY "txn_admin"
ON transactions
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') = 'admin')
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Escrows
DROP POLICY IF EXISTS "escrows_admin" ON escrows;
CREATE POLICY "escrows_admin"
ON escrows
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

-- Config / audit / email logs
DROP POLICY IF EXISTS "config_admin" ON config;
CREATE POLICY "config_admin"
ON config
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

DROP POLICY IF EXISTS "audit_admin" ON audit_log;
CREATE POLICY "audit_admin"
ON audit_log
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));

DROP POLICY IF EXISTS "email_log_admin" ON email_log;
CREATE POLICY "email_log_admin"
ON email_log
FOR ALL
USING ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'))
WITH CHECK ((auth.jwt()->'user_metadata'->>'role') IN ('admin','support'));
