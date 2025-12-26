-- BRZO DODAVANJE KOLONA U PAYMENTS TABELU
-- Pokrenite OVO PRVO ako dobijete grešku o nedostajućim kolonama

-- Step 1: Uklonite postojeći status constraint
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Step 2: Dodaj sve potrebne kolone
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS diver_id UUID REFERENCES public.users(id);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS diver_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_to_agency DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_to_adnana DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS add_for_kids DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_eur DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mixed';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_purpose TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 3: Dodaj novi constraint sa svim dozvoljenim vrednostima
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'completed', 'paid', 'partial', 'cancelled', 'refunded'));

-- Step 2: Provjeri da li su kolone dodane
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY column_name;

-- ✅ Gotovo! Sada možete pokrenuti IMPORT_PAYMENTS.sql
