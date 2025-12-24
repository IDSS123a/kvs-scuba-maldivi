-- ============================================
-- EMERGENCY PIN VERIFICATION DEBUG
-- ============================================

-- 1. See ALL users with ALL details
SELECT id, name, email, pin_code, status, role, created_at, updated_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Specifically look for PIN 538463
SELECT * FROM users 
WHERE pin_code = '538463';

-- 3. Check for any data inconsistencies with PINs
SELECT 
  pin_code, 
  LENGTH(pin_code) as length, 
  COUNT(*) as count 
FROM users 
WHERE pin_code IS NOT NULL 
GROUP BY pin_code 
HAVING COUNT(*) > 1;

-- 4. Check for whitespace or formatting issues
SELECT 
  email, 
  pin_code, 
  LENGTH(pin_code) as pin_length,
  CONCAT('''', pin_code, '''') as quoted_pin,
  status
FROM users 
WHERE pin_code IS NOT NULL
ORDER BY email;

-- 5. Check all approved users
SELECT name, email, pin_code, status 
FROM users 
WHERE status = 'approved'
ORDER BY created_at DESC;

-- 6. Count PINs by status
SELECT 
  status,
  COUNT(CASE WHEN pin_code IS NOT NULL THEN 1 END) as with_pin,
  COUNT(*) as total
FROM users
GROUP BY status;

-- 7. Find duplicate PINs
SELECT 
  pin_code,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM users
WHERE pin_code IS NOT NULL
GROUP BY pin_code
ORDER BY count DESC;

-- 8. Manual test - set a PIN for testing
-- UPDATE users SET pin_code = '538463', status = 'approved' 
-- WHERE email = 'aaaaaa@idss.ba';
