-- ========================================
-- NUCLEAR OPTION: Potpuno onemogući RLS
-- ========================================
-- Ova skripta će potpuno onemogućiti RLS na access_requests_audit

-- KORAK 1: Onemogući RLS
ALTER TABLE public.access_requests_audit DISABLE ROW LEVEL SECURITY;

-- KORAK 2: Obriši sve politike (za svaki slučaj)
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Allow INSERT for service role" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.access_requests_audit;

-- KORAK 3: Verifikacija - RLS bi trebao biti onemogućen
SELECT 
    tablename,
    rowsecurity AS "RLS Enabled (should be FALSE)"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'access_requests_audit';

-- KORAK 4: Provjeri da li ima politika (ne bi trebalo biti nijedne)
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'access_requests_audit';

-- KORAK 5: Status
SELECT 'RLS DISABLED - access_requests_audit is now fully accessible' AS status;
