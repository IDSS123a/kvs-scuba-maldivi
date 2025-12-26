-- IMPORT INICIJALNIH RONIOCA U SUPABASE
-- Kopirajte i pokrenite ovaj SQL u Supabase SQL Editor

-- 1. NAJPRE dodajte nedostajuca polja u users tabelu
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_dives INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS start_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS master_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ssi_pro_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_restriction TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- 2. IMPORT svih ronioca (sa PIN kodovima za login)
INSERT INTO public.users (
  name, email, phone, address, city, country, birth_date, age, total_dives, start_year,
  master_id, ssi_pro_id, photo_url, dietary_restriction,
  emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
  status, role, pin_code, created_at, updated_at
) VALUES
-- Zahida Ademovic
('Zahida Ademovic', 'zaadbos@gmail.com', '38761898860', 'Grbavicka 3', '71000 Sarajevo', 'Bosna i Hercegovina', '17.05.1969', 56, 115, 2022, '3930758', NULL, 'https://my.divessi.com/data/user_files/3/9/3/0/7/5/8/pic/3930758.png?1766333312', NULL, NULL, NULL, NULL, 'active', 'member', '111111', NOW(), NOW()),

-- Omer Merzic
('Omer Merzic', 'omer.merzic@gmail.com', '38762226988', 'Milana Preloga 19', '71000 Sarajevo', 'Bosna i Hercegovina', '07.03.1997', 28, 45, 2023, '3905400', NULL, 'https://my.divessi.com/data/user_files/3/9/0/5/4/0/0/pic/3905400.png?1766333450', NULL, NULL, NULL, NULL, 'active', 'member', '222222', NOW(), NOW()),

-- Naida Haracic
('Naida Haracic', 'naida@sportsport.ba', '38761686044', 'Soukbunar 1', '71000 Sarajevo', 'Bosna i Hercegovina', '12.01.1981', 44, 32, 2025, '4478426', NULL, 'https://my.divessi.com/data/user_files/4/4/7/8/4/2/6/pic/4478426.png?1766333761', NULL, NULL, NULL, NULL, 'active', 'member', '333333', NOW(), NOW()),

-- Emir Haracic
('Emir Haracic', 'emir@sportsport.ba', '38762244017', 'Soukbunar 1', '71000 Sarajevo', 'Bosna i Hercegovina', '21.01.1979', 46, 42, 2025, '4478415', NULL, 'https://my.divessi.com/data/user_files/4/4/7/8/4/1/5/pic/4478415.png?1766333812', NULL, NULL, NULL, NULL, 'active', 'member', '444444', NOW(), NOW()),

-- Muammer Mrahorovic (PRO - SSI Instructor)
('Muammer Mrahorovic', 'muammerm@gmail.com', '38762183344', 'Srdjana Aleksica 22 / InteaBH d.o.o.', '71000 Sarajevo', 'Bosna i Hercegovina', '02.05.1975', 50, 266, 2023, '3899956', '117803', 'https://my.divessi.com/data/user_files/3/8/9/9/9/5/6/pic/3899956.png?1766333881', NULL, NULL, NULL, NULL, 'active', 'admin', '555555', NOW(), NOW()),

-- Midhat Kozadra (PRO - SSI Instructor)
('Midhat Kozadra', 'mido.kozadra@gmail.com', '38761898727', 'Muje Sejte 93', '71000 Sarajevo', 'Bosna i Hercegovina', '26.11.1977', 48, 332, 2018, '2485581', '101570', 'https://my.divessi.com/data/user_files/2/4/8/5/5/8/1/pic/2485581.png?1766333929', NULL, 'Adisa Kozadra', 'Spouse', '38761303426', 'active', 'admin', '666666', NOW(), NOW()),

-- Anida Bejdjakic
('Anida Bejdjakic', 'b.anida@hotmail.com', '38761595495', 'Dzemala Bijedica 160', '71000 Sarajevo', 'Bosna i Hercegovina', '30.07.1988', 37, 43, 2025, '4486516', NULL, 'https://my.divessi.com/data/user_files/4/4/8/6/5/1/6/pic/4486516.png?1766333983', NULL, NULL, NULL, NULL, 'active', 'member', '777777', NOW(), NOW()),

-- Dora Kisic
('Dora Kisic', 'dorakisic7@gmail.com', '38598615651', 'Bulet 17, 20235 Zaton Veliki', '20235 Zaton Veliki', 'Hrvatska', '11.06.1999', 26, 69, 2022, '3943030', NULL, 'https://my.divessi.com/data/user_files/3/9/4/3/0/3/0/pic/3943030.png?1766334027', NULL, NULL, NULL, NULL, 'active', 'member', '888888', NOW(), NOW()),

-- Elmedina Maljevic Suljic
('Elmedina Maljevic Suljic', 'm.elmedina@hotmail.com', '38761358910', 'Breka 140', '71000 Sarajevo', 'Bosna i Hercegovina', '03.02.1978', 47, 155, 2024, '4104849', NULL, 'https://my.divessi.com/data/user_files/4/1/0/4/8/4/9/pic/4104849.png?1766334124', NULL, NULL, NULL, NULL, 'active', 'member', '101010', NOW(), NOW()),

-- Davor Mulalic (PRO - SSI Instructor) - VEĆ POSTOJI, UPDATE
-- ('Davor Mulalic', 'mulalic71@gmail.com', '38761787331', 'Mehmeda Spahe 4', '71000 Sarajevo', 'Bosna i Hercegovina', '21.09.1971', 54, 1030, 2000, '2787309', '95720', 'https://my.divessi.com/data/user_files/2/7/8/7/3/0/9/pic/2787309.png?1766334172', NULL, 'Amela Mulalić', 'Spouse', '38761615342', 'active', 'admin', '123456', NOW(), NOW()),

-- Adnan Drnda (PRO - SSI Instructor)
('Adnan Drnda', 'adnandrnda@hotmail.com', '38762332082', 'Marka Marulica 3', '71000 Sarajevo', 'Bosna i Hercegovina', '15.02.1970', 55, 1267, 2009, '2438732', '83562', 'https://my.divessi.com/data/user_files/2/4/3/8/7/3/2/pic/2438732.png?1766334235', 'No fish', 'Maja Drnda', 'Spouse', '38761360322', 'active', 'admin', '999999', NOW(), NOW()),

-- Samir Solakovic (PRO - SSI Instructor)
('Samir Solakovic', 'samirso@hotmail.com', '38761263651', 'Trg grada Prato', '71000 Sarajevo', 'Bosna i Hercegovina', '27.01.1967', 58, 1007, 2021, '2438727', '83563', 'https://my.divessi.com/data/user_files/2/4/3/8/7/2/7/pic/2438727.png?1766334288', NULL, 'Samra Solaković', 'Spouse', '38761835575', 'active', 'admin', '121212', NOW(), NOW()),

-- Nermin Skula (PRO - SSI Instructor)
('Nermin Skula', 'skulary@hotmail.com', '38761575242', 'Adema Hubijara 5', '71000 Sarajevo', 'Bosna i Hercegovina', '20.02.1978', 47, 225, 2023, '3713013', '118012', 'https://my.divessi.com/data/user_files/3/7/1/3/0/1/3/pic/3713013.png?1766334332', NULL, 'Anida Bejdjakic', '-', '38761595495', 'active', 'admin', '131313', NOW(), NOW()),

-- NeXo (bez email-a)
('NeXo', 'nexo@tempmail.com', '38761324599', NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'member', '141414', NOW(), NOW()),

-- Adisa Kozadra
('Adisa Kozadra', 'adisa.kozadra@tempmail.com', '38761303426', 'Muje Sejte 93', '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'member', '151515', NOW(), NOW()),

-- Djeca (4 djeteta)
('Dijete 1', 'dijete1@tempmail.com', NULL, NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'member', '161616', NOW(), NOW()),
('Dijete 2', 'dijete2@tempmail.com', NULL, NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'member', '171717', NOW(), NOW()),
('Dijete 3', 'dijete3@tempmail.com', NULL, NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'member', '181818', NOW(), NOW()),
('Dijete 4', 'dijete4@tempmail.com', NULL, NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'member', '191919', NOW(), NOW())

ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  birth_date = EXCLUDED.birth_date,
  age = EXCLUDED.age,
  total_dives = EXCLUDED.total_dives,
  start_year = EXCLUDED.start_year,
  master_id = EXCLUDED.master_id,
  ssi_pro_id = EXCLUDED.ssi_pro_id,
  photo_url = EXCLUDED.photo_url,
  dietary_restriction = EXCLUDED.dietary_restriction,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

-- 3. UPDATE Davor Mulalic (već postoji)
UPDATE public.users SET
  phone = '38761787331',
  address = 'Mehmeda Spahe 4',
  city = '71000 Sarajevo',
  country = 'Bosna i Hercegovina',
  birth_date = '21.09.1971',
  age = 54,
  total_dives = 1030,
  start_year = 2000,
  master_id = '2787309',
  ssi_pro_id = '95720',
  photo_url = 'https://my.divessi.com/data/user_files/2/7/8/7/3/0/9/pic/2787309.png?1766334172',
  emergency_contact_name = 'Amela Mulalić',
  emergency_contact_relationship = 'Spouse',
  emergency_contact_phone = '38761615342',
  updated_at = NOW()
WHERE email = 'mulalic71@gmail.com';

-- 4. VERIFIKACIJA
SELECT name, email, phone, total_dives, role, pin_code, status 
FROM public.users 
ORDER BY name;

-- ✅ GOTOVO! Svi ronilci su importovani sa PIN kodovima za login
