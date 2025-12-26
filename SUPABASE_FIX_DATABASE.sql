-- ✅ SUPABASE CRITICAL FIXES SQL SCRIPT
-- Execute in Supabase SQL Editor
-- Date: December 24, 2025

-- ===================================
-- STEP 1: Add missing columns to users table
-- ===================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_by UUID;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rejected_by UUID;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_pin_attempt TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pin_attempt_count INT DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ===================================
-- STEP 2: Create PIN attempts tracking table
-- ===================================
CREATE TABLE IF NOT EXISTS pin_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pin TEXT,
  success BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pin_attempts_email ON pin_attempts(email);
CREATE INDEX IF NOT EXISTS idx_pin_attempts_created_at ON pin_attempts(created_at);

-- ===================================
-- STEP 3: Create audit logs table if not exists
-- ===================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ===================================
-- STEP 4: Enable Row Level Security (RLS) - CRITICAL!
-- ===================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can see pending users (for approval)
CREATE POLICY users_select_pending_for_admins ON users
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    AND (status = 'pending' OR status = 'approved' OR status = 'active')
  );

-- Prevent public access to PIN codes
CREATE POLICY users_hide_pins ON users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Enable RLS on pin_attempts
ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view pin attempts
CREATE POLICY pin_attempts_select_admin ON pin_attempts
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own logs
CREATE POLICY audit_logs_select_own ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all logs
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ===================================
-- STEP 5: Create trigger for updated_at
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- STEP 6: Create trigger for last_login
-- ===================================
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_last_login ON users;
CREATE TRIGGER update_users_last_login
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND OLD.status != 'active')
  EXECUTE FUNCTION update_last_login();

-- ===================================
-- STEP 7: Reset all pending users (cleanup)
-- ===================================
-- Only reset if you're restarting - BE CAREFUL!
-- UPDATE users SET pin_code = NULL, status = 'pending' WHERE status IN ('pending', 'approved');

-- ===================================
-- STEP 8: Verify PIN uniqueness constraint
-- ===================================
-- Add unique constraint to ensure no duplicate PINs for approved/active users
ALTER TABLE users ADD CONSTRAINT unique_active_pin UNIQUE (pin_code) 
WHERE status IN ('approved', 'active');

-- ===================================
-- STEP 9: Create view for pending approvals
-- ===================================
CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
  id,
  name,
  email,
  phone,
  status,
  created_at,
  EXTRACT(HOUR FROM NOW() - created_at) as hours_pending
FROM users
WHERE status = 'pending'
ORDER BY created_at ASC;

-- ===================================
-- STEP 10: Grant proper permissions
-- ===================================
-- This depends on your auth setup, but typically:
-- Users can update their own profile
GRANT UPDATE ON users TO authenticated;

-- Only authenticated users can insert access requests
GRANT INSERT ON users TO authenticated;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================
-- Run these after applying all changes:

-- Check if columns were added
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS is enabled
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = TRUE;

-- Check pending users
-- SELECT id, name, email, status, created_at FROM users WHERE status = 'pending';

-- Check active users with PINs
-- SELECT id, name, email, pin_code, status, last_login FROM users WHERE status = 'active' AND pin_code IS NOT NULL;

-- ===================================
-- IMPORTANT NOTES
-- ===================================
-- 1. Review and test all policies carefully
-- 2. Backup database before applying RLS
-- 3. Test with non-admin user account
-- 4. Monitor audit_logs for any access denied errors
-- 5. Update frontend code to handle RLS errors gracefully
