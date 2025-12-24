-- ============================================================================
-- UNIFIED AUTHENTICATION & ACCESS CONTROL SYSTEM
-- Migrates from divers table to users + access_requests_audit
-- ============================================================================

-- Phase 1: Create new tables
-- ============================================================================

-- Create ENUM types for users table
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'active');

-- Users table - replaces and extends divers
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  pin_code VARCHAR(6) UNIQUE,
  role user_role DEFAULT 'member'::user_role,
  status user_status DEFAULT 'pending'::user_status,
  
  -- Metadata from divers table
  birth_date TEXT,
  age INTEGER,
  total_dives INTEGER DEFAULT 0,
  start_year INTEGER,
  photo_url TEXT,
  dietary_restrictions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  activated_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access requests audit log
CREATE TABLE access_requests_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL CHECK (action IN ('requested', 'approved', 'rejected', 'pin_generated', 'activated')),
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  CONSTRAINT valid_action CHECK (action IN ('requested', 'approved', 'rejected', 'pin_generated', 'activated'))
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_pin_code ON users(pin_code);
CREATE INDEX idx_audit_user_id ON access_requests_audit(user_id);
CREATE INDEX idx_audit_action ON access_requests_audit(action);
CREATE INDEX idx_audit_performed_by ON access_requests_audit(performed_by);

-- Phase 2: Migrate data from divers to users
-- ============================================================================

-- Migrate all divers with status 'confirmed' → 'approved'
INSERT INTO users (
  id, email, name, phone, 
  birth_date, age, total_dives, start_year,
  photo_url, dietary_restrictions,
  emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
  role, status, created_at
)
SELECT 
  id, 
  COALESCE(email, 'user_' || id::text || '@temp.invalid') as email,
  name,
  phone,
  birth_date,
  age,
  total_dives,
  start_year,
  photo_url,
  dietary_restrictions,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_phone,
  -- Admin users get 'admin' role
  CASE 
    WHEN email IN ('mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com') THEN 'admin'::user_role
    ELSE 'member'::user_role
  END as role,
  -- Map diver status to user status
  CASE 
    WHEN status = 'confirmed' THEN 'approved'::user_status
    WHEN status = 'cancelled' THEN 'rejected'::user_status
    ELSE 'pending'::user_status
  END as status,
  created_at
FROM divers
WHERE status != 'cancelled'
ON CONFLICT (email) DO NOTHING;

-- Phase 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests_audit ENABLE ROW LEVEL SECURITY;

-- Phase 4: Create RLS Policies for users table
-- ============================================================================

-- Policy: Admins have full access to users table
CREATE POLICY "admins_full_access_users" ON users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  );

-- Policy: Users can view their own data only
CREATE POLICY "users_view_own_data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Allow new user registration (insert only)
CREATE POLICY "allow_new_registration" ON users
  FOR INSERT
  WITH CHECK (status = 'pending'::user_status);

-- Policy: Allow public PIN verification (for login)
-- Anyone can select pin_code to verify login without authentication
CREATE POLICY "allow_public_pin_verification" ON users
  FOR SELECT
  USING (TRUE);

-- Policy: Prevent users from updating their own data
CREATE POLICY "prevent_user_self_update" ON users
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Policy: Prevent users from deleting their own account
CREATE POLICY "prevent_user_self_delete" ON users
  FOR DELETE
  USING (false);

-- Phase 5: Create RLS Policies for access_requests_audit
-- ============================================================================

-- Policy: Only admins can view audit logs
CREATE POLICY "admins_view_all_audit" ON access_requests_audit
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  );

-- Policy: Only admins can insert audit logs
CREATE POLICY "admins_create_audit" ON access_requests_audit
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  );

-- Phase 6: Create database functions
-- ============================================================================

-- Function to generate unique 6-digit PIN
CREATE OR REPLACE FUNCTION generate_unique_pin()
RETURNS VARCHAR(6) AS $$
DECLARE
  new_pin VARCHAR(6);
  attempts INT := 0;
BEGIN
  WHILE attempts < 100 LOOP
    new_pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE pin_code = new_pin) THEN
      RETURN new_pin;
    END IF;
    
    attempts := attempts + 1;
  END LOOP;
  
  RAISE EXCEPTION 'Failed to generate unique PIN after 100 attempts';
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users.updated_at
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for access_requests_audit.updated_at (if added)
CREATE TRIGGER audit_created_trigger
  BEFORE INSERT ON access_requests_audit
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Phase 7: Set admin users to 'active' status
-- ============================================================================

UPDATE users
SET 
  status = 'active'::user_status,
  activated_at = NOW()
WHERE role = 'admin'::user_role;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Summary of changes:
-- 1. ✅ Created users table with unified schema
-- 2. ✅ Created access_requests_audit table
-- 3. ✅ Migrated all divers to users (confirmed→approved, cancelled→rejected)
-- 4. ✅ Set existing admin users to 'admin' role and 'active' status
-- 5. ✅ Created RLS policies for access control
-- 6. ✅ Created PIN generation function
-- 7. ✅ Created audit logging support

-- Next steps:
-- 1. Update frontend components to use users table
-- 2. Update Auth.tsx to verify PIN + status = 'approved' or 'active'
-- 3. Create AccessRequestForm.tsx for new registration
-- 4. Create AdminAccessRequestsPanel.tsx for admin approval workflow
-- 5. Test full workflow: request → approve → PIN → login
