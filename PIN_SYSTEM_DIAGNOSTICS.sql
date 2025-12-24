-- ═══════════════════════════════════════════════════════════════════════════════
-- PIN SYSTEM DIAGNOSTICS - Complete Debugging Suite for PIN Verification Issues
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- USAGE:
-- 1. Open Supabase SQL Editor
-- 2. Copy and paste each section (commented with --) and run
-- 3. Review results against EXPECTED values below
-- 4. Use findings to diagnose PIN system issues
--
-- This suite covers:
-- - PIN storage verification (database)
-- - PIN data types (VARCHAR vs INTEGER issues)
-- - Whitespace/encoding problems
-- - User status transitions
-- - Approval workflow tracking
-- - RLS security settings
-- - Audit trail analysis
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 1: SYSTEM READINESS CHECK
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1.1: Check if RLS is enabled/disabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'audit_logs')
ORDER BY tablename;

-- EXPECTED: rowsecurity should be FALSE (disabled for development)
-- NOTE: If TRUE, only authenticated users can see data. This may affect diagnostics.

-- 1.2: Check table structure
\d+ users
\d+ audit_logs

-- 1.3: Check pin_code column definition
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'pin_code';

-- EXPECTED: data_type = 'character varying', character_maximum_length = 6, is_nullable = 'YES'

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 2: PIN INVENTORY & EXISTENCE CHECK
-- ═══════════════════════════════════════════════════════════════════════════════

-- 2.1: Count total users and users with PINs
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN pin_code IS NOT NULL THEN 1 END) as users_with_pins,
  COUNT(CASE WHEN pin_code IS NULL THEN 1 END) as users_without_pins
FROM users;

-- EXPECTED: Should show distribution of PIN assignment

-- 2.2: List ALL users with PINs (complete dump)
SELECT
  id,
  name,
  email,
  pin_code,
  status,
  role,
  created_at,
  updated_at
FROM users
WHERE pin_code IS NOT NULL
ORDER BY created_at DESC;

-- EXPECTED: Should show all assigned PINs with their users

-- 2.3: Find specific PIN (MODIFY '538463' AS NEEDED)
SELECT
  id,
  name,
  email,
  pin_code,
  status,
  role,
  created_at
FROM users
WHERE pin_code = '538463'
LIMIT 10;

-- EXPECTED: Should find user with PIN 538463 (if exists in database)

-- 2.4: List all PINs with their count
SELECT
  pin_code,
  COUNT(*) as user_count,
  STRING_AGG(email, ', ' ORDER BY email) as emails,
  STRING_AGG(status, ', ' ORDER BY status) as statuses
FROM users
WHERE pin_code IS NOT NULL
GROUP BY pin_code
ORDER BY pin_code;

-- EXPECTED: Each PIN should appear only once (no duplicates)

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 3: PIN DATA TYPE & ENCODING ANALYSIS
-- ═══════════════════════════════════════════════════════════════════════════════

-- 3.1: Check PIN data types in database
SELECT
  id,
  email,
  pin_code,
  pg_typeof(pin_code) as type,
  LENGTH(pin_code) as length,
  OCTET_LENGTH(pin_code) as byte_length,
  CAST(pin_code AS VARCHAR(6)) as as_varchar,
  CAST(pin_code AS TEXT) as as_text
FROM users
WHERE pin_code IS NOT NULL
ORDER BY email;

-- EXPECTED: type should be 'character varying'
-- EXPECTED: length should be 6 (or rarely 5 due to leading zero stripping)
-- EXPECTED: byte_length should equal or exceed length

-- 3.2: Find PINs with unusual characters or encoding
SELECT
  email,
  pin_code,
  LENGTH(pin_code) as length,
  OCTET_LENGTH(pin_code) as bytes,
  CASE WHEN LENGTH(pin_code) != OCTET_LENGTH(pin_code)
    THEN 'MULTI-BYTE CHARS DETECTED'
    ELSE 'ASCII only'
  END as encoding,
  CASE WHEN pin_code != TRIM(pin_code)
    THEN 'HAS LEADING/TRAILING WHITESPACE'
    ELSE 'No extra whitespace'
  END as whitespace,
  CASE WHEN POSITION(E'\n' IN pin_code) > 0
    THEN 'HAS NEWLINE'
    ELSE 'No newline'
  END as newline_check,
  CASE WHEN POSITION(E'\t' IN pin_code) > 0
    THEN 'HAS TAB'
    ELSE 'No tab'
  END as tab_check
FROM users
WHERE pin_code IS NOT NULL
ORDER BY email;

-- EXPECTED: encoding = 'ASCII only', whitespace = 'No extra whitespace', etc.
-- PROBLEM: If any show encoding issues, whitespace, newlines, or tabs

-- 3.3: Compare numeric vs string interpretation
SELECT
  email,
  pin_code as stored_value,
  CAST(pin_code AS INTEGER) as as_integer,
  CAST(pin_code AS NUMERIC) as as_numeric,
  CASE WHEN CAST(pin_code AS TEXT) ~ '^[0-9]{6}$'
    THEN 'Valid 6-digit PIN'
    ELSE 'NOT a valid 6-digit PIN'
  END as validity
FROM users
WHERE pin_code IS NOT NULL
ORDER BY email;

-- EXPECTED: All should be 'Valid 6-digit PIN'
-- PROBLEM: If any fail the regex, there's a formatting issue

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 4: PIN UNIQUENESS VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- 4.1: Check for duplicate PINs (constraint violation)
SELECT
  pin_code,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ') as user_ids,
  STRING_AGE(email, ', ' ORDER BY email) as emails
FROM users
WHERE pin_code IS NOT NULL
GROUP BY pin_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- EXPECTED: Should return NO ROWS (no duplicates)
-- PROBLEM: If any rows returned, there are duplicate PINs

-- 4.2: Check database constraints
SELECT
  constraint_name,
  constraint_type,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'users'
ORDER BY constraint_name;

-- EXPECTED: Should show UNIQUE constraint on pin_code
-- NOTE: If missing, duplicates are possible

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 5: USER STATUS ANALYSIS
-- ═══════════════════════════════════════════════════════════════════════════════

-- 5.1: User distribution by status
SELECT
  status,
  COUNT(*) as user_count,
  COUNT(CASE WHEN pin_code IS NOT NULL THEN 1 END) as with_pin,
  COUNT(CASE WHEN pin_code IS NULL THEN 1 END) as without_pin
FROM users
GROUP BY status
ORDER BY user_count DESC;

-- EXPECTED:
-- - pending: should NOT have PINs (waiting for approval)
-- - approved: SHOULD have PINs (approved but not logged in yet)
-- - active: SHOULD have PINs (logged in, using PIN)
-- - rejected: should NOT have PINs (access denied)

-- 5.2: Users in 'approved' status (ready to login)
SELECT
  id,
  name,
  email,
  pin_code,
  status,
  created_at,
  updated_at
FROM users
WHERE status = 'approved'
ORDER BY updated_at DESC;

-- EXPECTED: Should show all users ready to login with their PIN

-- 5.3: Users in 'pending' status (awaiting approval)
SELECT
  id,
  name,
  email,
  status,
  created_at
FROM users
WHERE status = 'pending'
ORDER BY created_at DESC;

-- EXPECTED: Should show users waiting for admin approval

-- 5.4: Timeline - when PINs were assigned
SELECT
  email,
  pin_code,
  status,
  created_at,
  updated_at,
  (updated_at - created_at) as time_to_approval
FROM users
WHERE pin_code IS NOT NULL
ORDER BY updated_at DESC;

-- EXPECTED: Should show PIN assignment timeline

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 6: PIN VERIFICATION SIMULATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- 6.1: Test exact PIN match (METHOD 1)
-- MODIFY '538463' to test different PIN
SELECT
  id,
  email,
  pin_code,
  status,
  'METHOD 1: Exact match found' as match_method
FROM users
WHERE pin_code = '538463';

-- 6.2: Test with string conversion (METHOD 2)
-- MODIFY '538463' to test different PIN
SELECT
  id,
  email,
  pin_code::TEXT as pin_as_text,
  status,
  'METHOD 2: After TEXT conversion' as match_method
FROM users
WHERE pin_code::TEXT = '538463';

-- 6.3: Test with TRIM (METHOD 3)
-- MODIFY '538463' to test different PIN
SELECT
  id,
  email,
  TRIM(pin_code) as pin_trimmed,
  status,
  'METHOD 3: After TRIM' as match_method
FROM users
WHERE TRIM(pin_code) = '538463';

-- 6.4: Comprehensive PIN comparison test
-- MODIFY '538463' to test different PIN
WITH test_pin AS (
  SELECT '538463'::VARCHAR(6) as search_value
)
SELECT
  u.id,
  u.email,
  u.pin_code as database_pin,
  t.search_value,
  (u.pin_code = t.search_value) as direct_match,
  (u.pin_code::TEXT = t.search_value) as text_match,
  (TRIM(u.pin_code) = TRIM(t.search_value)) as trimmed_match,
  CASE
    WHEN u.pin_code = t.search_value THEN '✅ Method 1 (direct)'
    WHEN u.pin_code::TEXT = t.search_value THEN '⚠️ Method 2 (text conversion)'
    WHEN TRIM(u.pin_code) = TRIM(t.search_value) THEN '⚠️ Method 3 (after trim)'
    ELSE '❌ NO MATCH'
  END as verification_status,
  u.status
FROM users u, test_pin t
WHERE u.pin_code IS NOT NULL
ORDER BY u.email;

-- EXPECTED: At least one column should show TRUE for the correct PIN
-- PROBLEM: If none show TRUE, PIN doesn't exist or has encoding issues

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 7: AUDIT LOG ANALYSIS
-- ═══════════════════════════════════════════════════════════════════════════════

-- 7.1: All audit logs (most recent first)
SELECT
  al.id,
  al.created_at,
  al.action,
  u.email as user_email,
  u.status as user_status,
  al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- EXPECTED: Should show approval, rejection, and status update logs

-- 7.2: Approval history (who was approved and when)
SELECT
  u.email,
  u.name,
  u.pin_code,
  al.created_at as approval_date,
  al.details
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.action LIKE '%approv%'
ORDER BY al.created_at DESC;

-- EXPECTED: Should show all user approvals with PIN assignment

-- 7.3: Count actions by type
SELECT
  action,
  COUNT(*) as count,
  MIN(created_at) as first_action,
  MAX(created_at) as last_action
FROM audit_logs
GROUP BY action
ORDER BY count DESC;

-- EXPECTED: Should show distribution of system actions

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 8: ADMIN & SYSTEM USER VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- 8.1: Find admin user(s)
SELECT
  id,
  name,
  email,
  role,
  status,
  pin_code,
  created_at
FROM users
WHERE role = 'admin'
  OR role ILIKE '%admin%'
  OR email LIKE '%admin%'
  OR email = 'mulalic71@gmail.com'
ORDER BY created_at;

-- EXPECTED: Should find at least one admin user
-- EXPECTED: Admin should have status = 'active'

-- 8.2: Check for users without email (should not exist)
SELECT
  id,
  name,
  email,
  status
FROM users
WHERE email IS NULL
  OR email = '';

-- EXPECTED: Should return NO ROWS (email is required)

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 9: SYSTEM HEALTH CHECK
-- ═══════════════════════════════════════════════════════════════════════════════

-- 9.1: Summary statistics
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE pin_code IS NOT NULL) as users_with_pins,
  (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
  (SELECT COUNT(*) FROM users WHERE status = 'approved') as approved_users,
  (SELECT COUNT(*) FROM users WHERE status = 'pending') as pending_users,
  (SELECT COUNT(*) FROM audit_logs) as total_audit_logs,
  NOW() as check_timestamp;

-- EXPECTED: Shows overall system state

-- 9.2: Most recent activities
SELECT
  'User created' as activity_type,
  MAX(created_at) as last_occurrence
FROM users
UNION ALL
SELECT
  'PIN assigned',
  MAX(updated_at)
FROM users
WHERE pin_code IS NOT NULL
UNION ALL
SELECT
  'Audit logged',
  MAX(created_at)
FROM audit_logs
ORDER BY last_occurrence DESC;

-- EXPECTED: Shows when last activity occurred

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 10: PROBLEM DIAGNOSIS & TROUBLESHOOTING
-- ═══════════════════════════════════════════════════════════════════════════════

-- 10.1: Identify PINs that might not verify
SELECT
  email,
  pin_code,
  status,
  CASE
    WHEN pin_code IS NULL THEN '❌ NO PIN'
    WHEN LENGTH(pin_code) != 6 THEN '❌ WRONG LENGTH: ' || LENGTH(pin_code)
    WHEN pin_code !~ '^[0-9]{6}$' THEN '❌ INVALID FORMAT'
    WHEN status NOT IN ('approved', 'active') THEN '❌ USER NOT APPROVED'
    WHEN pin_code != TRIM(pin_code) THEN '❌ HAS WHITESPACE'
    ELSE '✅ SHOULD VERIFY'
  END as diagnosis
FROM users
ORDER BY email;

-- EXPECTED: Most should show '✅ SHOULD VERIFY'
-- PROBLEM: Any showing ❌ need investigation

-- 10.2: Find users who can't login (issues)
SELECT
  email,
  status,
  pin_code,
  CASE
    WHEN status = 'pending' THEN 'Cannot login: awaiting approval'
    WHEN status = 'rejected' THEN 'Cannot login: access denied'
    WHEN status = 'active' AND pin_code IS NOT NULL THEN 'Can login'
    WHEN status = 'approved' AND pin_code IS NOT NULL THEN 'Can login (not logged in yet)'
    ELSE 'Cannot login: unknown reason'
  END as login_status
FROM users
ORDER BY status, email;

-- EXPECTED: Shows who can login and why others can't

-- ═══════════════════════════════════════════════════════════════════════════════
-- MANUAL TEST OPERATIONS (UNCOMMENT AND MODIFY AS NEEDED)
-- ═══════════════════════════════════════════════════════════════════════════════

-- TEST 1: Insert a test user with a test PIN
-- INSERT INTO users (email, name, pin_code, status, role)
-- VALUES ('test-pin@example.com', 'Test User', '999999', 'approved', 'user')
-- RETURNING id, email, pin_code, status;

-- TEST 2: Update a user with a new PIN
-- UPDATE users
-- SET pin_code = '777777', status = 'approved', updated_at = NOW()
-- WHERE email = 'test@example.com'
-- RETURNING email, pin_code, status, updated_at;

-- TEST 3: Verify test PIN persists
-- SELECT id, email, pin_code, status FROM users WHERE email = 'test-pin@example.com';

-- TEST 4: Test exact PIN search
-- SELECT id, email, pin_code, status FROM users WHERE pin_code = '999999';

-- TEST 5: Delete test user (cleanup)
-- DELETE FROM users WHERE email = 'test-pin@example.com';

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF DIAGNOSTICS
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- INTERPRETATION GUIDE:
-- 1. If PINs exist but don't verify: Check Section 3 (encoding issues)
-- 2. If users are pending: They need admin approval (Section 5)
-- 3. If PIN not found: Check Section 6 (verification simulation)
-- 4. If duplicates found: Check constraints (Section 4)
-- 5. If status wrong: Check user status analysis (Section 5)
-- 6. For any issue: Run Sections 1-3 first, then targeted diagnosis
-- ═══════════════════════════════════════════════════════════════════════════════
