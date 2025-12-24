-- DEBUGGING QUERIES
-- Use these in Supabase SQL Editor to diagnose issues

-- ============================================
-- CHECK DATABASE STATE
-- ============================================

-- 1. List all users with details
SELECT 
  id,
  name,
  email,
  status,
  pin_code,
  role,
  created_at,
  updated_at
FROM users
ORDER BY created_at DESC;

-- 2. Count users by status
SELECT 
  status,
  COUNT(*) as count
FROM users
GROUP BY status
ORDER BY status;

-- 3. Find users with pins
SELECT 
  name,
  email,
  pin_code,
  status,
  role
FROM users
WHERE pin_code IS NOT NULL
ORDER BY pin_code;

-- 4. Check for duplicate emails
SELECT 
  email,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(name, ', ') as names,
  STRING_AGG(status::text, ', ') as statuses
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================
-- TEST SPECIFIC SCENARIOS
-- ============================================

-- 5. Check test1@example.com status (should be approved or active)
SELECT 
  id,
  name,
  email,
  status,
  pin_code,
  created_at
FROM users
WHERE email = 'test1@example.com';

-- 6. Verify PIN 111111 works
SELECT 
  id,
  name,
  email,
  status,
  pin_code
FROM users
WHERE pin_code = '111111';

-- 7. Check if admin user exists
SELECT 
  id,
  name,
  email,
  status,
  pin_code,
  role
FROM users
WHERE role = 'admin'
ORDER BY created_at;

-- 8. Find specific user by email
SELECT 
  id,
  name,
  email,
  status,
  pin_code,
  role,
  created_at,
  updated_at
FROM users
WHERE email = 'john.doe@example.com';
  -- REPLACE 'john.doe@example.com' with email you're checking

-- ============================================
-- RLS POLICY STATUS
-- ============================================

-- 9. Check RLS enabled/disabled status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'audit_logs')
ORDER BY tablename;

-- 10. View RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'audit_logs')
ORDER BY tablename, policyname;

-- ============================================
-- AUDIT LOG CHECK
-- ============================================

-- 11. View recent audit logs
SELECT 
  id,
  user_id,
  action,
  details,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- 12. Audit logs for specific user
SELECT 
  id,
  user_id,
  action,
  details,
  created_at
FROM audit_logs
WHERE user_id = '...'  -- REPLACE with user ID
ORDER BY created_at DESC;

-- ============================================
-- QUICK HEALTH CHECK
-- ============================================

-- 13. Health check query (run all at once)
WITH user_summary AS (
  SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN pin_code IS NOT NULL THEN 1 ELSE 0 END) as users_with_pins
  FROM users
),
admin_summary AS (
  SELECT 
    COUNT(*) as admin_count,
    STRING_AGG(name, ', ') as admin_names
  FROM users
  WHERE role = 'admin'
),
duplicates_summary AS (
  SELECT 
    COUNT(*) as duplicate_email_count
  FROM (
    SELECT email
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  ) t
)
SELECT 
  '=== USERS ===' as section,
  total_users::text as metric,
  ''::text as value
FROM user_summary

UNION ALL

SELECT 
  'Pending',
  pending_count::text,
  ''
FROM user_summary

UNION ALL

SELECT 
  'Approved',
  approved_count::text,
  ''
FROM user_summary

UNION ALL

SELECT 
  'Active',
  active_count::text,
  ''
FROM user_summary

UNION ALL

SELECT 
  'Rejected',
  rejected_count::text,
  ''
FROM user_summary

UNION ALL

SELECT 
  'With PINs',
  users_with_pins::text,
  ''
FROM user_summary

UNION ALL

SELECT 
  '=== ADMINS ===',
  admin_count::text,
  admin_names
FROM admin_summary

UNION ALL

SELECT 
  '=== ISSUES ===',
  duplicate_email_count::text,
  'duplicate emails'
FROM duplicates_summary;

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- 14. If user can't login with correct PIN
-- First check the PIN exists
SELECT 
  name,
  email,
  pin_code,
  status
FROM users
WHERE pin_code = '111111';  -- REPLACE with PIN they're trying

-- 15. If registration gets 409 error
-- Check what emails exist
SELECT 
  email,
  status,
  COUNT(*) as count
FROM users
WHERE email = 'test@example.com'  -- REPLACE with email they tried
GROUP BY email, status;

-- 16. If PIN not updating to active
-- Check the specific user
SELECT 
  id,
  name,
  email,
  status,
  updated_at
FROM users
WHERE email = 'test1@example.com'  -- REPLACE with user email
ORDER BY updated_at DESC;

-- 17. If PIN verification says "no results"
-- But PIN might exist - check case sensitivity
SELECT 
  email,
  pin_code,
  LENGTH(pin_code) as pin_length,
  status
FROM users
WHERE pin_code LIKE '%111111%' OR pin_code = '111111';

-- ============================================
-- TABLE STRUCTURE
-- ============================================

-- 18. Check users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 19. Check constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'users'
ORDER BY constraint_name;

-- 20. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users'
ORDER BY indexname;

-- ============================================
-- IF ALL ELSE FAILS - FULL RESET
-- ============================================

-- ⚠️ DANGEROUS: Only run if you want to completely reset
-- This will DELETE ALL USER DATA!

-- DROP TABLE audit_logs CASCADE;
-- DROP TABLE users CASCADE;
-- 
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR NOT NULL,
--   email VARCHAR UNIQUE NOT NULL,
--   phone VARCHAR,
--   pin_code VARCHAR(6),
--   status VARCHAR DEFAULT 'pending',
--   role VARCHAR DEFAULT 'member',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE TABLE audit_logs (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id),
--   action VARCHAR,
--   details TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
--
-- INSERT INTO users (name, email, phone, status, pin_code, role) VALUES
--   ('Admin', 'mulalic71@gmail.com', '', 'active', '123456', 'admin');
