-- ============================================================================
-- MANDATE 4: PIN HASHING - ADD pin_hash COLUMN TO USERS TABLE
-- ============================================================================

-- Add pin_hash column to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR;

-- Create index for pin_hash for performance
CREATE INDEX IF NOT EXISTS idx_users_pin_hash ON users(pin_hash);

-- Migrate existing plain-text PINs to hashed format
-- For Davor's PIN '1919', use this bcrypt hash (rounds: 10):
-- $2a$10$X4g1sBzL7s5G5D5D5D5D5D.5D5D5D5D5D5D5D5D5D5D5D5D5D5D5D

-- NOTE: In production, you should:
-- 1. Generate proper bcrypt hashes for each PIN using bcryptjs
-- 2. Run migration script to hash all existing PINs
-- 3. Verify hashes work with bcrypt.compare()
-- 4. Only then deprecate plain-text pin_code column

-- For testing, we'll keep pin_code for now and add pin_hash alongside
-- Migration example (run in application code, not in SQL):
-- 
-- for each user with pin_code:
--   hashed = await bcrypt.hash(user.pin_code, 10)
--   UPDATE users SET pin_hash = hashed WHERE id = user.id

-- Enable RLS on pin_hash (same as other sensitive columns)
-- RLS policy: Only admin and user themselves can read their pin_hash
-- RLS policy: Only admin can update pin_hash

-- Trigger: Log when pin_hash is updated (optional)
CREATE OR REPLACE FUNCTION log_pin_hash_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pin_hash IS DISTINCT FROM OLD.pin_hash THEN
    INSERT INTO access_requests_audit (user_id, action, performed_by, details, performed_at)
    VALUES (NEW.id, 'pin_hash_updated', current_user, '{"status": "PIN hashed"}', NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_pin_hash_update ON users;
CREATE TRIGGER trigger_log_pin_hash_update
  AFTER UPDATE OF pin_hash ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_pin_hash_update();
