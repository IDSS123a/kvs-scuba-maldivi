-- ==========================================
-- HITNA ISPRAVKA ULOGA (ADMIN vs MEMBER)
-- ==========================================

-- 1. Prvo postavite SVE korisnike na 'member' (sigurnosni reset)
UPDATE public.users 
SET role = 'member';

-- 2. Zatim eksplicitno postavite Admine SAMO za Davora, Adnana i Samira
UPDATE public.users 
SET role = 'admin' 
WHERE email IN (
    'mulalic71@gmail.com', 
    'adnandrnda@hotmail.com', 
    'samirso@hotmail.com'
);

-- 3. Provjera Pro statusa (da budemo sigurni da Pro status ne dira Ulogu)
-- Ovo je samo komentar: Kolona is_pro ostaje netaknuta, ona označava instruktore, ali NE daje admin prava.
