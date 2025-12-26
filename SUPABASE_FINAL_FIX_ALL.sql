-- CRITICAL DATABASE REPAIR SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR IMMEDIATELY

-- 1. Create user_role type if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'member', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create users table (if not exists) matches React code expectations
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'pending', -- Can be 'admin', 'member', 'pending'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active', 'revoked'
    pin_code TEXT, -- Legacy plain text PIN (for reference/debugging)
    pin_hash TEXT, -- SECURE BCRYPT HASH
    phone TEXT,
    ssi_number TEXT,
    experience_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID,
    rejection_reason TEXT
);

-- 3. Create payments table matches PaymentManager.tsx
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount_to_agency DECIMAL(10,2) DEFAULT 0,
    amount_to_adnan DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'refunded'
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create audit_logs table (Was MISSING)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- 7. TEMPORARY: Allow ALL access (to fix 404/permission issues immediately)
-- We drop existing policies first to ensure clean slate
DROP POLICY IF EXISTS "Allow all access_users" ON public.users;
CREATE POLICY "Allow all access_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access_payments" ON public.payments;
CREATE POLICY "Allow all access_payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access_audit" ON public.audit_logs;
CREATE POLICY "Allow all access_audit" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access_checklist" ON public.checklist_items;
CREATE POLICY "Allow all access_checklist" ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);

-- 8. Fix Admin User (Ensure YOU are admin)
-- Replace with your actual email if different
INSERT INTO public.users (id, email, name, role, status, pin_code)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin', 'active', '123456'
FROM auth.users
WHERE email = 'mulalic71@gmail.com'
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', status = 'active';

