-- KONAČNA POPRAVKA ZA ADMIN PRISTUP I AUDIT LOGOVE (VERZIJA 3)

-- 1. UKLANJANJE PRIVREMENOG OGRANIČENJA KOJE KOČI PROMENU TIPA
-- Prvo skidamo Foreign Key koji zahteva UUID
ALTER TABLE public.access_requests_audit 
DROP CONSTRAINT IF EXISTS access_requests_audit_performed_by_fkey;

-- 2. PROMENA TIPA KOLONE U TEXT 
-- Sada možemo promeniti tip u TEXT tako da kolona prihvata bilo šta (i email i UUID)
ALTER TABLE public.access_requests_audit 
ALTER COLUMN performed_by TYPE TEXT;

-- 3. POSTAVLJANJE ADMINISTRATORA (Davor, Adnan, Samir)
-- Koristimo ILIKE radi sigurnosti (nebitna velika/mala slova i kvačice)
UPDATE public.users 
SET role = 'admin', status = 'active'
WHERE name ILIKE '%Davor Mulali%'
   OR name ILIKE '%Adnan Drnda%'
   OR name ILIKE '%Samir Solaković%';

-- 4. RESET SVIH OSTALIH NA 'member' (Sigurnosna mera)
UPDATE public.users 
SET role = 'member'
WHERE name NOT ILIKE '%Davor Mulali%'
  AND name NOT ILIKE '%Adnan Drnda%'
  AND name NOT ILIKE '%Samir Solaković%';

-- 5. PROVERA: Izlistaj sve trenutne admine
SELECT id, name, email, role FROM public.users WHERE role = 'admin';
