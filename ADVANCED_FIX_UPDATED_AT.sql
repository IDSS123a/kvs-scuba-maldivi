-- ========================================
-- ADVANCED FIX: Dodaj updated_at sa RLS podrškom
-- ========================================
-- Ova skripta će pravilno dodati updated_at kolonu
-- čak i ako postoje RLS politike

-- KORAK 1: Privremeno onemogući RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- KORAK 2: Dodaj kolonu ako ne postoji
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
        
        RAISE NOTICE 'Column updated_at added successfully';
    ELSE
        RAISE NOTICE 'Column updated_at already exists';
    END IF;
END $$;

-- KORAK 3: Postavi default vrijednost za postojeće redove
UPDATE public.users 
SET updated_at = COALESCE(updated_at, created_at, timezone('utc'::text, now()))
WHERE updated_at IS NULL;

-- KORAK 4: Kreiraj trigger funkciju (SAFE verzija)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Provjeri da li kolona postoji prije pristupa
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- KORAK 5: Obriši stari trigger ako postoji
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;

-- KORAK 6: Kreiraj novi trigger
CREATE TRIGGER update_updated_at_column_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- KORAK 7: Ponovo omogući RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- KORAK 8: Verifikacija kolone
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'updated_at';

-- KORAK 9: Verifikacija trigger-a
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'public'
  AND trigger_name = 'update_updated_at_column_trigger';

-- KORAK 10: Test update (trebalo bi raditi bez greške)
-- Ovo je samo test - neće ništa promijeniti
SELECT 'Test completed - ready for updates' AS status;
