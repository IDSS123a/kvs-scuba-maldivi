-- ISPRAVLJEN IMPORT UPLATA PREMA VAŠIM INSTRUKCIJAMA
-- Agencija: 925 EUR | Adnan: 915 EUR | Ukupno: 1,840 EUR po osobi

-- 1. PRIPREMA TABELE (Uklanjanje constraint-a i dodavanje kolona)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;

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
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Očistite stare podatke ako želite svjež import (OPCIONALNO - zakomentarisano)
-- DELETE FROM public.payments;

-- 2. FUNKCIJA ZA BRZI INSERT (kako bi kod bio pregledniji)
DO $$
DECLARE
    diver_record RECORD;
    -- Iznosi
    agency_amt DECIMAL := 925.00;
    adnan_amt DECIMAL := 915.00;
    total_amt DECIMAL := 1840.00;
    -- Datum i Svrha
    p_date DATE := '2025-12-09'; -- Sastanak u Vistafonu
    p_purpose TEXT := 'Predračun br. 916/12-25';
BEGIN
    -- Prolazimo kroz sve korisnike iz users tabele
    FOR diver_record IN SELECT id, name, email FROM public.users LOOP
        
        -- Davor Mulalić je besplatan (organizator)
        IF diver_record.email = 'mulalic71@gmail.com' THEN
            INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose, status, note)
            VALUES (diver_record.id, diver_record.name, 0, 0, 0, 0, p_date, p_purpose, 'completed', 'Organizator (Complimentary)');
        
        -- Svi ostali plaćaju punu cijenu
        ELSE
            INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose, status)
            VALUES (diver_record.id, diver_record.name, agency_amt, adnan_amt, 0, total_amt, p_date, p_purpose, 'completed')
            ON CONFLICT DO NOTHING;
        END IF;

    END LOOP;
END $$;

-- 3. PROVJERA FINANSIJA
SELECT 
    'Agencija (SJJ)' as Kategorija, SUM(paid_to_agency) as Total_EUR FROM public.payments
UNION ALL
SELECT 
    'Adnan (MLE Cash)', SUM(paid_to_adnana) FROM public.payments
UNION ALL
SELECT 
    'UKUPNO PRIKUPLJENO', SUM(amount_eur) FROM public.payments;
