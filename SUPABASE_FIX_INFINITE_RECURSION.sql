-- SUPABASE RLS INFINITE RECURSION FIX
-- This fixes the "infinite recursion detected in policy" error

-- STEP 1: Disable RLS temporarily to break the recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies (they're causing the recursion)
DROP POLICY IF EXISTS "Allow all access for users" ON public.users;
DROP POLICY IF EXISTS "Allow all access_payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all access_audit" ON public.audit_logs;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

-- Drop any other policies that might exist
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname); 
    END LOOP; 
END $$;

DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'payments' AND schemaname = 'public'
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', pol.policyname); 
    END LOOP; 
END $$;

DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'audit_logs' AND schemaname = 'public'
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', pol.policyname); 
    END LOOP; 
END $$;

-- STEP 3: Add missing columns if needed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avg_consumption DECIMAL(10,2);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- STEP 4: Set admin PIN
UPDATE public.users 
SET status = 'active', role = 'admin', pin_code = '123456' 
WHERE email = 'mulalic71@gmail.com';

-- STEP 5: Grant permissions to anon role (allows unauthenticated access)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;
GRANT ALL ON public.audit_logs TO anon, authenticated;

-- ALTERNATIVE: If you want to keep RLS enabled, use this instead of STEP 5:
-- Re-enable RLS with NON-RECURSIVE policies
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anon read" ON public.users FOR SELECT TO anon USING (true);
-- CREATE POLICY "Allow anon insert" ON public.users FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon update" ON public.users FOR UPDATE TO anon USING (true);
-- CREATE POLICY "Allow anon delete" ON public.users FOR DELETE TO anon USING (true);
