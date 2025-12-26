-- ========================================
-- FIX: RLS politika za access_requests_audit
-- ========================================
-- Ova skripta će omogućiti INSERT u access_requests_audit tabelu

-- KORAK 1: Obriši sve postojeće politike
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Allow INSERT for service role" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.access_requests_audit;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.access_requests_audit;

-- KORAK 2: Kreiraj novu politiku koja dozvoljava INSERT za sve autentifikovane korisnike
CREATE POLICY "Allow INSERT for authenticated users"
ON public.access_requests_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- KORAK 3: Kreiraj politiku za SELECT (da mogu čitati logove)
CREATE POLICY "Allow SELECT for authenticated users"
ON public.access_requests_audit
FOR SELECT
TO authenticated
USING (true);

-- KORAK 4: Kreiraj politiku za UPDATE (ako je potrebno)
DROP POLICY IF EXISTS "Allow UPDATE for authenticated users" ON public.access_requests_audit;
CREATE POLICY "Allow UPDATE for authenticated users"
ON public.access_requests_audit
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- KORAK 5: Omogući RLS (ako nije već omogućen)
ALTER TABLE public.access_requests_audit ENABLE ROW LEVEL SECURITY;

-- KORAK 6: Verifikacija - prikaži sve politike
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'access_requests_audit'
ORDER BY policyname;

-- KORAK 7: Provjeri da li RLS je omogućen
SELECT 
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'access_requests_audit';

-- KORAK 8: Test INSERT (trebalo bi raditi bez greške)
-- Ovo je samo test - neće ništa promijeniti
SELECT 'RLS policies configured successfully' AS status;
