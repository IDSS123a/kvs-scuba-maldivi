-- ========================================
-- DIJAGNOSTIKA: Provjeri sve trigger-e i RLS politike
-- ========================================

-- KORAK 1: Prikaži sve trigger-e na users tabeli
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- KORAK 2: Prikaži sve RLS politike na users tabeli
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
WHERE tablename = 'users'
ORDER BY policyname;

-- KORAK 3: Prikaži sve RLS politike na access_requests_audit tabeli
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
WHERE tablename = 'access_requests_audit'
ORDER BY policyname;

-- KORAK 4: Provjeri da li access_requests_audit tabela postoji
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%audit%'
ORDER BY table_name;

-- KORAK 5: Prikaži strukturu access_requests_audit tabele (ako postoji)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'access_requests_audit'
ORDER BY ordinal_position;
