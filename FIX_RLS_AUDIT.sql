-- ========================================
-- FIX: Row Level Security za access_requests_audit
-- ========================================
-- Ova skripta će omogućiti INSERT u access_requests_audit tabelu

-- OPCIJA 1: Privremeno onemogući RLS na access_requests_audit
-- (Najbrže rješenje za development)
ALTER TABLE IF EXISTS public.access_requests_audit DISABLE ROW LEVEL SECURITY;

-- OPCIJA 2: Dodaj RLS politiku koja dozvoljava INSERT za sve autentifikovane korisnike
-- (Sigurnije rješenje)
-- Prvo provjerimo da li tabela postoji
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'access_requests_audit'
    ) THEN
        -- Omogući RLS
        ALTER TABLE public.access_requests_audit ENABLE ROW LEVEL SECURITY;
        
        -- Obriši stare politike
        DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.access_requests_audit;
        DROP POLICY IF EXISTS "Allow INSERT for service role" ON public.access_requests_audit;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.access_requests_audit;
        
        -- Kreiraj novu politiku koja dozvoljava INSERT za sve autentifikovane korisnike
        CREATE POLICY "Allow INSERT for authenticated users"
        ON public.access_requests_audit
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
        
        -- Kreiraj politiku za SELECT (da mogu čitati svoje logove)
        DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.access_requests_audit;
        CREATE POLICY "Allow SELECT for authenticated users"
        ON public.access_requests_audit
        FOR SELECT
        TO authenticated
        USING (true);
        
        RAISE NOTICE 'RLS policies created successfully for access_requests_audit';
    ELSE
        RAISE NOTICE 'Table access_requests_audit does not exist - skipping';
    END IF;
END $$;

-- OPCIJA 3: Ako tabela ne postoji, kreirajmo je
CREATE TABLE IF NOT EXISTS public.access_requests_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES public.users(id)
);

-- Omogući RLS na novoj tabeli
ALTER TABLE public.access_requests_audit ENABLE ROW LEVEL SECURITY;

-- Dodaj politike
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.access_requests_audit;
CREATE POLICY "Allow INSERT for authenticated users"
ON public.access_requests_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.access_requests_audit;
CREATE POLICY "Allow SELECT for authenticated users"
ON public.access_requests_audit
FOR SELECT
TO authenticated
USING (true);

-- Verifikacija
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'access_requests_audit';

-- Provjeri da li RLS je omogućen
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'access_requests_audit';
