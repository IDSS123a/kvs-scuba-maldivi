-- ========================================
-- ALTERNATIVA: Ukloni trigger ako ne želite updated_at
-- ========================================

-- Obriši trigger
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;

-- Obriši funkciju
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Verifikacija - ne bi trebalo vratiti nijedan red
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_name = 'update_updated_at_column_trigger';
