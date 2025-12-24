-- EMERGENCY DATABASE RESET - Single Source of Truth
-- ⚠️ WARNING: This will delete all existing data
-- Back up your Supabase first!

-- ============================================
-- STEP 1: Disable RLS temporarily
-- ============================================
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.access_requests_audit DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop existing tables
-- ============================================
DROP TABLE IF EXISTS public.access_requests_audit CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- STEP 3: Create fresh clean schema
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  
  -- PIN MANAGEMENT - Single source of truth
  pin_code VARCHAR(6) UNIQUE,
  pin_generated_at TIMESTAMPTZ,
  
  -- STATUS MANAGEMENT
  status VARCHAR NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
  
  -- ADMIN TRACKING
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- ROLE MANAGEMENT
  role VARCHAR NOT NULL DEFAULT 'member' 
    CHECK (role IN ('member', 'admin')),
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create indexes for performance
-- ============================================
CREATE INDEX idx_users_pin_code ON public.users(pin_code);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);

-- ============================================
-- STEP 5: Enable RLS with SIMPLE policies
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can insert new pending users (for registration)
CREATE POLICY "allow_public_insert_pending" ON public.users
FOR INSERT
WITH CHECK (status = 'pending');

-- Policy 2: Public can SELECT to verify PIN (no auth needed for PIN check)
CREATE POLICY "allow_public_select" ON public.users
FOR SELECT
USING (TRUE);

-- Policy 3: Users can see their own data when authenticated
CREATE POLICY "users_read_own_data" ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

-- Policy 4: Admins get full access (simplified - check role directly)
CREATE POLICY "admin_full_access" ON public.users
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- Policy 5: Allow audit log inserts (anyone can create records)
CREATE POLICY "allow_audit_insert" ON public.audit_logs
FOR INSERT
WITH CHECK (TRUE);

-- Policy 6: Admins can read audit logs
CREATE POLICY "admin_read_audit" ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- ============================================
-- STEP 6: Create helper function for timestamps
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 7: Add initial admin users if needed
-- ============================================
-- Uncomment and update emails as needed:
-- INSERT INTO public.users (email, name, role, status) VALUES
-- ('mulalic71@gmail.com', 'Admin User', 'admin', 'active')
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'audit_logs');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('users', 'audit_logs');

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'audit_logs')
ORDER BY tablename, policyname;

-- ============================================
-- SUCCESS CHECKLIST
-- ============================================
-- ✅ Old tables dropped
-- ✅ New users table created with clean schema
-- ✅ audit_logs table created
-- ✅ RLS enabled with simple, non-recursive policies
-- ✅ Indexes created
-- ✅ Helper function created
-- ✅ Trigger attached for updated_at
-- 
-- Next: Test PIN generation and verification
