-- FINALNI I JEDINI ISPRAVAN IMPORT UPLATA
-- Rukovodi se isključivo tabelom dostavljenom od strane korisnika

-- 1. ČIŠĆENJE TABELE
DELETE FROM public.payments;

-- 2. UNOS PODATAKA
DO $$
DECLARE
    p_purpose TEXT := 'Predračun br. 916/12-25';
    p_date DATE := '2025-12-20';
BEGIN

    -- Zahida Ademovic (925 + 915)
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose, note)
    SELECT id, 'Zahida Ademovic', 925, 915, 0, 1840, p_date, p_purpose, 'Dodatne informacije o popustima ili ratama.'
    FROM public.users WHERE name ILIKE '%Zahida Ademovic%';

    -- Omer Merzic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Omer Merzic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Omer Merzic%';

    -- Naida Haracic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Naida Haracic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Naida Haracic%';

    -- Emir Haracic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Emir Haracic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Emir Haracic%';

    -- Muammer Mrahorovic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Muammer Mrahorovic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Muammer Mrahorovic%';

    -- Midhat Kozadra
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Midhat Kozadra', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Midhat Kozadra%';

    -- Anida Bejdjakic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Anida Bejdjakic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Anida Bejdjakic%';

    -- Dora Kisic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Dora Kisic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Dora Kisic%';

    -- Elmedina Maljevic Suljic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Elmedina Maljevic Suljic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Elmedina%';

    -- Davor Mulalic (0 + 0)
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Davor Mulalic', 0, 0, 0, 0, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Davor Mulali%';

    -- Adnan Drnda
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Adnan Drnda', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Adnan Drnda%';

    -- Samir Solakovic
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Samir Solakovic', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Samir Solakovic%';

    -- Nermin Skula
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Nermin Skula', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Nermin Skula%';

    -- NeXo
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'NeXo', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%NeXo%';

    -- Adisa Kozadra
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Adisa Kozadra', 925, 915, 0, 1840, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Adisa Kozadra%';

    -- Djeca (0 + 0 + 150)
    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Dijete 1', 0, 0, 150, 150, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Dijete 1%';

    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Dijete 2', 0, 0, 150, 150, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Dijete 2%';

    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Dijete 3', 0, 0, 150, 150, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Dijete 3%';

    INSERT INTO public.payments (diver_id, diver_name, paid_to_agency, paid_to_adnana, add_for_kids, amount_eur, payment_date, payment_purpose)
    SELECT id, 'Dijete 4', 0, 0, 150, 150, p_date, p_purpose
    FROM public.users WHERE name ILIKE '%Dijete 4%';

END $$;

-- 3. FINALNA PROVJERA
SELECT 
    COUNT(*) as broj_uplatnica,
    SUM(paid_to_agency) as total_agencija,
    SUM(paid_to_adnana) as total_adnan,
    SUM(add_for_kids) as total_djeca,
    SUM(amount_eur) as ukupno_eur
FROM public.payments;
