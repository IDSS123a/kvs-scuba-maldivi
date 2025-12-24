-- ============================================================================
-- PIN VERIFICATION DIAGNOSTIC SCRIPT
-- Following Corrected Constitution v2.0
-- Purpose: Verify PIN storage in users table with pin_code field
-- ============================================================================

-- DIAGNOSTIC 1: Check all users with PINs stored correctly
SELECT 
  id,
  name,
  email,
  pin_code,
  LENGTH(pin_code) as pin_length,
  status,
  created_at,
  updated_at
FROM users
WHERE pin_code IS NOT NULL
ORDER BY updated_at DESC
LIMIT 20;

-- DIAGNOSTIC 2: Verify specific PIN (example: 813178)
SELECT 
  id,
  name,
  email,
  pin_code,
  status
FROM users
WHERE pin_code = '813178';

-- DIAGNOSTIC 3: Check for any remaining data in old divers table
SELECT 
  id,
  name,
  access_pin_hash,
  access_status
FROM divers
WHERE access_pin_hash IS NOT NULL
LIMIT 10;

-- DIAGNOSTIC 4: Pin code uniqueness check
SELECT 
  pin_code,
  COUNT(*) as count
FROM users
WHERE pin_code IS NOT NULL
GROUP BY pin_code
HAVING COUNT(*) > 1;

-- DIAGNOSTIC 5: Users status distribution
SELECT 
  status,
  COUNT(*) as count
FROM users
GROUP BY status;

-- DIAGNOSTIC 6: PIN format validation (should all be exactly 6 digits)
SELECT 
  id,
  name,
  email,
  pin_code,
  LENGTH(pin_code) as pin_length,
  CASE 
    WHEN pin_code ~ '^\d{6}$' THEN 'VALID'
    ELSE 'INVALID'
  END as validation_status
FROM users
WHERE pin_code IS NOT NULL
ORDER BY LENGTH(pin_code) DESC;
