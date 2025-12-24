-- ============================================================================
-- KVS-SCUBA MALDIVES 2026: Authentication & Access Control System
-- SIMPLIFIED MIGRATION - Adds only missing columns
-- ============================================================================

-- Step 1: Create the access status enum type
-- Note: If type already exists, you'll see "type status_type already exists" - this is safe to ignore
DO $$ BEGIN
  CREATE TYPE status_type AS ENUM ('pending', 'approved', 'revoked');
EXCEPTION WHEN duplicate_object THEN
  -- Type already exists, do nothing
END $$;

-- Step 2: Add new columns to the divers table for access control
-- These columns support the new PIN-based authentication system
-- Note: Some columns may already exist (is_pro, status), so we use IF NOT EXISTS
ALTER TABLE divers
ADD COLUMN IF NOT EXISTS access_pin_hash TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS access_status status_type DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS pin_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Step 3: Add indexes for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_divers_access_status ON divers(access_status);
CREATE INDEX IF NOT EXISTS idx_divers_email_access ON divers(email, access_status);
CREATE INDEX IF NOT EXISTS idx_divers_is_pro ON divers(is_pro);
CREATE INDEX IF NOT EXISTS idx_divers_pin_hash ON divers(access_pin_hash);

-- Step 4: Pre-approve the three expedition organizers
UPDATE divers
SET 
  access_status = 'approved',
  is_pro = TRUE
WHERE email IN ('mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com');

-- Step 5: Create an audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES divers(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES divers(id) ON DELETE SET NULL,
  target_table TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create an access request log (historical records)
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE CASCADE,
  request_status status_type DEFAULT 'pending',
  approved_by_id UUID REFERENCES divers(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Enable Row Level Security on new tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
DO $$ BEGIN
  CREATE POLICY "access_requests_public_read" ON access_requests
    FOR SELECT
    USING (TRUE);
EXCEPTION WHEN duplicate_object THEN
  -- Policy already exists, do nothing
END $$;

DO $$ BEGIN
  CREATE POLICY "access_requests_insert" ON access_requests
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN
  -- Policy already exists, do nothing
END $$;

-- Migration complete
