-- EMERGENCY DATABASE RESET - CLEAN SLATE
-- Copy and paste ALL commands below into Supabase SQL Editor
-- Click RUN - execute all at once

-- ============================================
-- DISABLE RLS FIRST (for testing)
-- ============================================
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP ALL EXISTING TABLES
-- ============================================
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- CREATE SIMPLE USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  pin_code VARCHAR(6),
  status VARCHAR DEFAULT 'pending',
  role VARCHAR DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE SIMPLE AUDIT LOG TABLE
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT ADMIN USER (YOU)
-- ============================================
INSERT INTO public.users (email, name, role, status, pin_code) VALUES
('mulalic71@gmail.com', 'Davor Mulalic', 'admin', 'active', '123456')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_pin ON public.users(pin_code);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);

-- ============================================
-- VERIFICATION - Run these to check
-- ============================================
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('users', 'audit_logs');

-- Check admin user exists
SELECT id, email, name, role, status, pin_code FROM public.users 
WHERE email = 'mulalic71@gmail.com';

-- Count all users
SELECT COUNT(*) as total_users FROM public.users;

-- ============================================
-- SUCCESS CHECKLIST
-- ============================================
-- ✓ Old tables dropped
-- ✓ New clean schema created
-- ✓ Admin user inserted
-- ✓ Indexes created
-- ✓ RLS DISABLED (for now)
-- 
-- NEXT: Update frontend code and test
