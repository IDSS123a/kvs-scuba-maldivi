-- ========================================
-- FIND AND REMOVE AUDIT TRIGGERS
-- ========================================
-- Ova skripta će pronaći i ukloniti sve trigger-e koji kreiraju audit logove

-- KORAK 1: Prikaži sve trigger-e na users tabeli
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- KORAK 2: Ukloni sve trigger-e koji sadrže "audit" u nazivu
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'users'
          AND event_object_schema = 'public'
          AND (
              trigger_name ILIKE '%audit%' 
              OR action_statement ILIKE '%access_requests_audit%'
          )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.users', trigger_record.trigger_name);
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- KORAK 3: Ručno obriši poznate trigger-e koji mogu kreirati audit logove
DROP TRIGGER IF EXISTS log_access_request_approval ON public.users;
DROP TRIGGER IF EXISTS audit_user_changes ON public.users;
DROP TRIGGER IF EXISTS track_user_updates ON public.users;
DROP TRIGGER IF EXISTS create_audit_log ON public.users;

-- KORAK 4: Verifikacija - prikaži preostale trigger-e
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- KORAK 5: Status
SELECT 'Audit triggers removed from users table' AS status;
