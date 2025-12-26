-- ✅ SUPABASE CRITICAL FIXES - QUICK COPY/PASTE VERSION
-- Execute EXACTLY in this order in Supabase SQL Editor
-- Provjeri da je svaki korak 🟢 GREEN prije nego nastavi na sljedeći

-- ===========================================
-- STEP 1/10: Add missing columns
-- ===========================================
-- Diver profile columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_dives INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS start_year INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS master_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ssi_pro_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Security/Auth columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_pin_attempt TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_attempt_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verify: SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users';
-- Should be >= 20 columns now

-- ===========================================
-- STEP 2/10: Create PIN attempts table
-- ===========================================
CREATE TABLE IF NOT EXISTS pin_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pin TEXT,
  success BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pin_attempts_email ON pin_attempts(email);
CREATE INDEX IF NOT EXISTS idx_pin_attempts_created_at ON pin_attempts(created_at);

-- Verify: SELECT tablename FROM pg_tables WHERE tablename='pin_attempts';

-- ===========================================
-- STEP 3/10: Create audit logs table
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Verify: SELECT COUNT(*) FROM pg_tables WHERE tablename='audit_logs';

-- ===========================================
-- STEP 4/10: Enable RLS on users table
-- ===========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can see all users
DROP POLICY IF EXISTS "users_select_admin" ON users;
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Prevent PIN from being visible except for own profile
DROP POLICY IF EXISTS "users_hide_pins_from_others" ON users;
CREATE POLICY "users_hide_pins_from_others" ON users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ===========================================
-- STEP 5/10: Enable RLS on pin_attempts
-- ===========================================
ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pin_attempts_admin_only" ON pin_attempts;
CREATE POLICY "pin_attempts_admin_only" ON pin_attempts
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin');

-- ===========================================
-- STEP 6/10: Enable RLS on audit_logs
-- ===========================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users see their own logs
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins see all logs
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin');

-- ===========================================
-- STEP 7/10: Create updated_at trigger
-- ===========================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
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

-- ===========================================
-- STEP 8/10: Create last_login trigger
-- ===========================================
DROP FUNCTION IF EXISTS update_last_login() CASCADE;
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.last_login = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_last_login ON users;
CREATE TRIGGER update_users_last_login
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- ===========================================
-- STEP 9/10: Create unique PIN index
-- ===========================================
-- Drop old constraint/index if exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_active_pin;
DROP INDEX IF EXISTS idx_unique_active_pin;

-- Create partial unique index - only for approved/active users
CREATE UNIQUE INDEX idx_unique_active_pin ON users(pin_code) 
WHERE status IN ('approved', 'active');

-- ===========================================
-- STEP 10/10: Create views for admin
-- ===========================================
DROP VIEW IF EXISTS pending_approvals;
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

DROP VIEW IF EXISTS active_users_summary;
CREATE OR REPLACE VIEW active_users_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) as total_users
FROM users;

-- ===========================================
-- VERIFICATION QUERIES (run after each step)
-- ===========================================

-- Check columns added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;

-- Check tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND (tablename IN ('users', 'pin_attempts', 'audit_logs'));

-- Check policies
-- SELECT schemaname, tablename, policyname FROM pg_policies ORDER BY tablename;

-- Check views created
-- SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE '%approval%';

-- Check triggers
-- SELECT trigger_name, event_object_table FROM information_schema.triggers 
-- WHERE trigger_schema = 'public' ORDER BY event_object_table;

-- ===========================================
-- FINAL CHECKS
-- ===========================================

-- 1. Check pending users
SELECT COUNT(*) as pending FROM users WHERE status = 'pending';

-- 2. Check approved users
SELECT COUNT(*) as approved FROM users WHERE status = 'approved';

-- 3. Check active users
SELECT COUNT(*) as active FROM users WHERE status = 'active';

-- 4. Check rejected users
SELECT COUNT(*) as rejected FROM users WHERE status = 'rejected';

-- 5. Check audit logs created
SELECT COUNT(*) as audit_log_count FROM audit_logs;

-- 6. Check pin attempts logged
SELECT COUNT(*) as pin_attempts FROM pin_attempts;

-- 7. Check users have created_at
SELECT COUNT(*) as with_created_at FROM users WHERE created_at IS NOT NULL;

-- 8. Check RLS is enabled
SELECT COUNT(*) as rls_enabled FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = TRUE 
AND tablename IN ('users', 'pin_attempts', 'audit_logs');

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================

-- If you see all green checkmarks above, ALL STEPS COMPLETED SUCCESSFULLY! ✅

-- Now follow:
-- 1. SUPABASE_TESTING_GUIDE.md to test all scenarios
-- 2. SUPABASE_FIX_ACTION_PLAN.md for deployment steps
