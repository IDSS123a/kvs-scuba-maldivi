-- ========================================
-- DIJAGNOSTIKA: Provjeri is_pro polje za sve korisnike
-- ========================================

-- KORAK 1: Prikaži sve korisnike sa is_pro i role poljima
SELECT 
    id,
    name,
    email,
    role,
    is_pro,
    status,
    CASE 
        WHEN is_pro = true THEN '✅ Professional'
        WHEN is_pro = false THEN '❌ Not Professional'
        WHEN is_pro IS NULL THEN '⚠️ NULL (needs default)'
    END AS is_pro_status,
    CASE 
        WHEN role = 'admin' THEN '👑 Admin'
        WHEN role = 'member' THEN '👤 Member'
        ELSE '❓ Unknown'
    END AS role_status
FROM public.users
ORDER BY name;

-- KORAK 2: Prikaži neslaganja (gdje is_pro i role nisu usklađeni)
SELECT 
    id,
    name,
    email,
    role,
    is_pro,
    'MISMATCH: is_pro and role are not synchronized' AS issue
FROM public.users
WHERE (is_pro = true AND role != 'admin')
   OR (is_pro = false AND role = 'admin')
   OR (is_pro IS NULL);

-- KORAK 3: Postavi default vrijednost za is_pro ako je NULL
UPDATE public.users
SET is_pro = false
WHERE is_pro IS NULL;

-- KORAK 4: Sinhronizuj is_pro sa role (opciono - samo ako želite)
-- Odkomentirajte sljedeće linije ako želite sinhronizovati:
-- UPDATE public.users
-- SET is_pro = (role = 'admin');
