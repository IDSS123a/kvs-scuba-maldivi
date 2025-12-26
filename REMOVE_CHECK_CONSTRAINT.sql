-- ========================================
-- FIX: Ukloni CHECK constraint na access_requests_audit
-- ========================================
-- Ova skripta će ukloniti CHECK constraint koji blokira INSERT

-- KORAK 1: Prikaži sve CHECK constraint-e na access_requests_audit tabeli
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'access_requests_audit'
  AND nsp.nspname = 'public'
  AND con.contype = 'c'  -- 'c' = CHECK constraint
ORDER BY con.conname;

-- KORAK 2: Ukloni CHECK constraint
ALTER TABLE public.access_requests_audit 
DROP CONSTRAINT IF EXISTS access_requests_audit_action_check;

-- KORAK 3: Ukloni sve druge CHECK constraint-e (ako postoje)
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'access_requests_audit'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE public.access_requests_audit DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- KORAK 4: Verifikacija - ne bi trebalo biti nijednog CHECK constraint-a
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'access_requests_audit'
  AND nsp.nspname = 'public'
  AND con.contype = 'c'
ORDER BY con.conname;

-- KORAK 5: Status
SELECT 'CHECK constraints removed from access_requests_audit' AS status;
