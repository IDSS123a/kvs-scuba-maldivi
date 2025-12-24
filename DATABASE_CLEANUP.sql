-- DATABASE CLEANUP & TEST DATA SETUP
-- Run this in Supabase SQL Editor to prepare for testing

-- ============================================
-- 1. CHECK CURRENT DATABASE STATE
-- ============================================
SELECT 'TABLE CHECK: users' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check for duplicate emails
SELECT email, COUNT(*) as count, STRING_AGG(id::text, ', ') as ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Check current users
SELECT id, name, email, status, pin_code, role, created_at
FROM users
ORDER BY created_at DESC;

-- ============================================
-- 2. CLEAN UP DUPLICATES
-- ============================================
-- Delete duplicate pending users (keep the oldest one)
DELETE FROM users WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM users 
    WHERE status = 'pending'
  ) t 
  WHERE t.rn > 1
);

-- ============================================
-- 3. ADD TEST DATA WITH PINS
-- ============================================
-- Delete existing test users if they exist
DELETE FROM users 
WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'testadmin@example.com');

-- Add test users with pre-assigned PINs for testing
INSERT INTO users (name, email, phone, status, pin_code, role, created_at, updated_at) VALUES
  -- Approved users with PINs ready to login
  ('Test User 1', 'test1@example.com', '+1-555-0001', 'approved', '111111', 'member', NOW(), NOW()),
  ('Test User 2', 'test2@example.com', '+1-555-0002', 'approved', '222222', 'member', NOW(), NOW()),
  
  -- Active user (already logged in before)
  ('Test User 3', 'test3@example.com', '+1-555-0003', 'active', '333333', 'member', NOW(), NOW()),
  
  -- Test admin user
  ('Test Admin', 'testadmin@example.com', '+1-555-9999', 'active', '654321', 'admin', NOW(), NOW())
ON CONFLICT DO NOTHING;  -- Don't error if they already exist

-- ============================================
-- 4. VERIFY DATA IS CORRECT
-- ============================================
SELECT '✅ VERIFICATION COMPLETE' as result;

SELECT 'Available test users:' as info;
SELECT 
  name, 
  email, 
  status, 
  pin_code,
  role,
  created_at
FROM users
WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'testadmin@example.com', 'mulalic71@gmail.com')
ORDER BY email;

SELECT 'Summary:' as info;
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
FROM users;

-- ============================================
-- 5. TEST DATA REFERENCE
-- ============================================
-- Use these credentials for testing:
--
-- TEST 1: PIN VERIFICATION (approved user)
-- Email: test1@example.com
-- PIN: 111111
-- Status: approved → will become active after login
--
-- TEST 2: ADMIN LOGIN
-- Email: testadmin@example.com
-- PIN: 654321
-- Status: active (already admin)
--
-- TEST 3: CREATE NEW USER (go through approval)
-- Use registration form with new email
-- Admin approves → gets new PIN
-- User logs in with new PIN
--
-- TEST 4: ORIGINAL ADMIN
-- Email: mulalic71@gmail.com
-- PIN: 123456
-- Status: active
-- ============================================
