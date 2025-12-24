-- ============================================================================
-- KVS-SCUBA MALDIVES 2026: Authentication & Access Control System
-- Migration File: Adds PIN-based auth, access status, and admin controls
-- ============================================================================

-- Step 1: Create the access status enum type
CREATE TYPE status_type AS ENUM ('pending', 'approved', 'revoked');

-- Step 2: Add new columns to the divers table for access control
-- These columns support the new PIN-based authentication system
ALTER TABLE divers
ADD COLUMN access_pin_hash TEXT DEFAULT NULL COMMENT 'Hashed 6-digit PIN for secure login',
ADD COLUMN access_status status_type DEFAULT 'pending' COMMENT 'Access approval status: pending, approved, or revoked',
ADD COLUMN pin_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL COMMENT 'When the PIN was generated',
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE DEFAULT NULL COMMENT 'Track user activity',
ADD COLUMN is_pro BOOLEAN DEFAULT FALSE COMMENT 'Indicates if user has admin/organizer privileges';

-- Step 3: Ensure critical columns exist (if not already present)
-- These are idempotent checks - won't fail if columns already exist
-- If your divers table already has these, no action needed
-- ALTER TABLE divers ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown' ON CONFLICT DO NOTHING;
-- ALTER TABLE divers ADD COLUMN email TEXT UNIQUE ON CONFLICT DO NOTHING;
-- ALTER TABLE divers ADD COLUMN phone TEXT ON CONFLICT DO NOTHING;

-- Step 4: Add indexes for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_divers_access_status ON divers(access_status);
CREATE INDEX IF NOT EXISTS idx_divers_email_access ON divers(email, access_status);
CREATE INDEX IF NOT EXISTS idx_divers_is_pro ON divers(is_pro);
CREATE INDEX IF NOT EXISTS idx_divers_pin_hash ON divers(access_pin_hash);

-- Step 5: Pre-approve the three expedition organizers
-- IMPORTANT: You must manually set their PIN hashes after this migration
-- For now, these users are marked as approved but PIN-less (admin override)
UPDATE divers
SET 
  access_status = 'approved',
  is_pro = TRUE,
  name = 'Davor Mulalić'
WHERE email = 'mulalic71@gmail.com';

UPDATE divers
SET 
  access_status = 'approved',
  is_pro = TRUE,
  name = 'Adnan Drnda'
WHERE email = 'adnandrnda@hotmail.com';

UPDATE divers
SET 
  access_status = 'approved',
  is_pro = TRUE,
  name = 'Samir Solakovic'
WHERE email = 'samirso@hotmail.com';

-- Step 6: Create an audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES divers(id) ON DELETE SET NULL,
  action TEXT NOT NULL COMMENT 'E.g., "approved_user", "revoked_access", "updated_payment"',
  target_user_id UUID REFERENCES divers(id) ON DELETE SET NULL,
  target_table TEXT COMMENT 'Table that was modified',
  details JSONB COMMENT 'Additional context about the action',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create an access request log (historical records)
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE CASCADE,
  request_status status_type DEFAULT 'pending',
  approved_by_id UUID REFERENCES divers(id) ON DELETE SET NULL COMMENT 'Admin who approved',
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Enable Row Level Security on new tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for audit logs (admins only)
CREATE POLICY "audit_log_admins_only" ON admin_audit_log
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM divers WHERE divers.id = auth.uid() AND divers.is_pro = TRUE
  ));

-- Step 10: Create RLS policies for access requests (admins only)
CREATE POLICY "access_requests_public_read" ON access_requests
  FOR SELECT
  USING (TRUE);

CREATE POLICY "access_requests_admins_write" ON access_requests
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "access_requests_admins_update" ON access_requests
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM divers WHERE divers.id = auth.uid() AND divers.is_pro = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM divers WHERE divers.id = auth.uid() AND divers.is_pro = TRUE
  ));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Execute this migration in Supabase SQL Editor
-- 2. Manually verify the divers table has the new columns
-- 3. For admin users (Davor, Adnan, Samir), you'll generate their PINs in the app
-- 4. Deploy the new authentication components (AccessRequestForm, PinLogin, AdminDashboard)
-- ============================================================================
