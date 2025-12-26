-- PROVJERA I POPRAVKA PERMISIJA I KOLONA
-- 1. Popravka uloga za ronioce koji trebaju biti ADMINI
UPDATE public.users 
SET role = 'admin' 
WHERE email IN (
  'mulalic71@gmail.com', -- Davor
  'mido.kozadra@gmail.com', -- Midhat
  'nexo@tempmail.com', -- NeXo (ako je on admin)
  'adnan@tempmail.com' -- Adnan
);

-- 2. Provjera performed_by kolone (ako se nalazi u nekoj audit tabeli)
-- Ako imate trigger koji puni performed_by, on mora dobijati UUID.
-- Provjerite da li tabela 'users' ima tu kolonu (za svaki slučaj)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS performed_by UUID;

-- 3. Postavljanje statusa za brzi pristup (ako su zapeli u pending)
UPDATE public.users SET status = 'active' WHERE role = 'admin';
