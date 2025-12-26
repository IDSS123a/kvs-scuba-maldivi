-- PRECIZNO POSTAVLJANJE STATUSA ZA 19 ČLANOVA GRUPE MALDIVI 2025

-- 1. DODAVANJE POTREBNIH KOLONA (ako ne postoje)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_diver BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 1.1 KREIRANJE TRIGGER FUNKCIJE ZA UPDATED_AT (ako ne postoji)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.2 DODAVANJE TRIGER-A NA USERS TABELU
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;
CREATE TRIGGER update_updated_at_column_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. RESET SVIH NA DEFAULT (Svi su ronioci osim onih koje eksplicitno isključimo)
UPDATE public.users SET is_diver = TRUE, is_pro = FALSE;

-- 3. POSTAVLJANJE NE-RONILACA (6 osoba)
UPDATE public.users 
SET is_diver = FALSE 
WHERE name ILIKE '%Dijete%'
   OR name ILIKE '%Adisa Kozadra%'
   OR name ILIKE '%NeXo%';

-- 4. POSTAVLJANJE ADMINISTRATORA / PRO (3 osobe)
UPDATE public.users 
SET is_pro = TRUE, role = 'admin'
WHERE name ILIKE '%Davor Mulali%'
   OR name ILIKE '%Adnan Drnda%'
   OR name ILIKE '%Samir Solakovi%';

-- 5. VERIFIKACIJA STATUSA
SELECT name, is_diver, is_pro, role, status 
FROM public.users 
ORDER BY is_diver DESC, name ASC;
