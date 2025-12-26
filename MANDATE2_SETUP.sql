-- ============================================================================
-- MANDATE 2: SETUP SCRIPT - PIN & TEST DATA
-- ============================================================================

-- Step 1: Set PIN for Davor (Admin Login Test)
-- ============================================================================
UPDATE users 
SET pin_code = '1919' 
WHERE email = 'mulalic71@gmail.com';

-- Step 2: Verify the update
SELECT 
  email, 
  name, 
  role, 
  status, 
  pin_code,
  created_at
FROM users 
WHERE email = 'mulalic71@gmail.com';

-- Step 3: Show all admin users with their PIN status
SELECT 
  email, 
  name, 
  role, 
  status, 
  pin_code,
  activated_at
FROM users 
WHERE role = 'admin'::user_role
ORDER BY created_at;

-- Step 4: Verify tables and functions exist
SELECT 
  'users' as table_name,
  COUNT(*) as row_count,
  'active' as status
FROM users
UNION ALL
SELECT 
  'access_requests_audit' as table_name,
  COUNT(*) as row_count,
  'initialized' as status
FROM access_requests_audit;

-- Step 5: Test PIN generation function
SELECT generate_unique_pin() as test_pin;

-- ============================================================================
-- Expected Results:
-- 1. Davor's PIN should be updated to '1919'
-- 2. All 3 admins should appear with status='active'
-- 3. PIN generation function should return a random 6-digit number
-- ============================================================================
