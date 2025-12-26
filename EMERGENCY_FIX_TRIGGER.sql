-- ========================================
-- EMERGENCY FIX: Ukloni problematični trigger
-- ========================================
-- Ova skripta će ukloniti trigger koji uzrokuje grešku
-- "record new has no field updated_at"

-- KORAK 1: Prikaži sve trigger-e na users tabeli
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public';

-- KORAK 2: Obriši sve trigger-e koji sadrže "updated_at"
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- KORAK 3: Obriši funkcije koje pokušavaju pristupiti updated_at
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- KORAK 4: Verifikacija - ne bi trebalo vratiti nijedan red
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public';

-- KORAK 5: Provjeri da li kolona updated_at postoji
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'updated_at';
