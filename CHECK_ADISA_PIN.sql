-- ========================================
-- DIJAGNOSTIKA: Provjeri PIN za Adisa Kozadra
-- ========================================

-- KORAK 1: Prikaži sve podatke za Adisa Kozadra
SELECT 
    id,
    name,
    email,
    status,
    role,
    pin_code,
    pin_hash,
    created_at,
    updated_at
FROM public.users
WHERE name ILIKE '%Adisa%Kozadra%'
   OR email ILIKE '%adisa%';

-- KORAK 2: Prikaži sve korisnike sa statusom 'approved'
SELECT 
    id,
    name,
    email,
    status,
    pin_code,
    CASE 
        WHEN pin_hash IS NOT NULL THEN '✅ PIN hash exists'
        ELSE '❌ No PIN hash'
    END AS pin_hash_status
FROM public.users
WHERE status = 'approved'
ORDER BY name;

-- KORAK 3: Prikaži sve korisnike sa statusom 'active'
SELECT 
    id,
    name,
    email,
    status,
    pin_code,
    CASE 
        WHEN pin_hash IS NOT NULL THEN '✅ PIN hash exists'
        ELSE '❌ No PIN hash'
    END AS pin_hash_status
FROM public.users
WHERE status = 'active'
ORDER BY name;
