-- ========================================
-- FIX: Dodavanje updated_at kolone i trigger-a
-- ========================================

-- KORAK 1: Dodaj updated_at kolonu ako ne postoji
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- KORAK 2: Postavi default vrijednost za postojeće redove
UPDATE public.users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- KORAK 3: Kreiraj trigger funkciju
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- KORAK 4: Obriši stari trigger ako postoji
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;

-- KORAK 5: Kreiraj novi trigger
CREATE TRIGGER update_updated_at_column_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- KORAK 6: Verifikacija
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'updated_at';

-- KORAK 7: Provjeri trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_name = 'update_updated_at_column_trigger';
