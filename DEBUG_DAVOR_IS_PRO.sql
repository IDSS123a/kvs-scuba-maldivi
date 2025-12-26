-- ========================================
-- HITNA DIJAGNOSTIKA: Provjeri Davor Mulalić
-- ========================================

-- KORAK 1: Prikaži sve podatke za Davor Mulalić
SELECT 
    id,
    name,
    email,
    role,
    is_pro,
    status,
    created_at,
    updated_at
FROM public.users
WHERE name ILIKE '%Davor%Mulal%'
   OR email ILIKE '%mulalic%';

-- KORAK 2: Prikaži SVE korisnike sa is_pro i role
SELECT 
    name,
    email,
    role,
    is_pro,
    CASE 
        WHEN is_pro IS NULL THEN '⚠️ NULL'
        WHEN is_pro = true THEN '✅ TRUE'
        WHEN is_pro = false THEN '❌ FALSE'
    END AS is_pro_display
FROM public.users
ORDER BY name;

-- KORAK 3: Postavi is_pro = true za Davor Mulalić (TEST)
UPDATE public.users
SET is_pro = true,
    role = 'admin'
WHERE name ILIKE '%Davor%Mulal%'
   OR email ILIKE '%mulalic%';

-- KORAK 4: Verifikacija - prikaži ponovo
SELECT 
    name,
    email,
    role,
    is_pro,
    'After manual update' AS note
FROM public.users
WHERE name ILIKE '%Davor%Mulal%'
   OR email ILIKE '%mulalic%';
