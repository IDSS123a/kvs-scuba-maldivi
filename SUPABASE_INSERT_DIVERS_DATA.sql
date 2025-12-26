-- ✅ RONJAČI & PODACI - INSERT SCRIPT
-- Execute this AFTER SUPABASE_QUICK_FIX.sql
-- Copy/paste u Supabase SQL Editor

-- ===========================================
-- STEP 1: Delete old data (ako trebam početi ispočetka)
-- ===========================================
-- Uncomment if you want to start fresh:
-- DELETE FROM users WHERE id >= 101;

-- ===========================================
-- STEP 2: Insert ronjače (divers)
-- ===========================================

INSERT INTO users (
  name, 
  email, 
  phone, 
  address, 
  city, 
  country, 
  birth_date, 
  age, 
  total_dives, 
  start_year, 
  master_id, 
  ssi_pro_id, 
  photo_url, 
  dietary_restrictions, 
  emergency_contact_name, 
  emergency_contact_relationship, 
  emergency_contact_phone, 
  status, 
  role,
  created_at, 
  updated_at
) VALUES
  ('Zahida Ademovic', 'zaadbos@gmail.com', '38761898860', 'Grbavicka 3', '71000 Sarajevo', 'Bosna i Hercegovina', '1969-05-17', 56, 115, 2022, '3930758', NULL, 'https://my.divessi.com/data/user_files/3/9/3/0/7/5/8/pic/3930758.png?1766333312', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Omer Merzic', 'omer.merzic@gmail.com', '38762226988', 'Milana Preloga 19', '71000 Sarajevo', 'Bosna i Hercegovina', '1997-03-07', 28, 45, 2023, '3905400', NULL, 'https://my.divessi.com/data/user_files/3/9/0/5/4/0/0/pic/3905400.png?1766333450', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Naida Haracic', 'naida@sportsport.ba', '38761686044', 'Soukbunar 1', '71000 Sarajevo', 'Bosna i Hercegovina', '1981-01-12', 44, 32, 2025, '4478426', NULL, 'https://my.divessi.com/data/user_files/4/4/7/8/4/2/6/pic/4478426.png?1766333761', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Emir Haracic', 'emir@sportsport.ba', '38762244017', 'Soukbunar 1', '71000 Sarajevo', 'Bosna i Hercegovina', '1979-01-21', 46, 42, 2025, '4478415', NULL, 'https://my.divessi.com/data/user_files/4/4/7/8/4/1/5/pic/4478415.png?1766333812', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Muammer Mrahorovic', 'muammerm@gmail.com', '38762183344', 'Srdjana Aleksica 22 / InteaBH d.o.o.', '71000 Sarajevo', 'Bosna i Hercegovina', '1975-05-02', 50, 266, 2023, '3899956', '117803', 'https://my.divessi.com/data/user_files/3/8/9/9/9/5/6/pic/3899956.png?1766333881', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Midhat Kozadra', 'mido.kozadra@gmail.com', '38761898727', 'Muje Sejte 93', '71000 Sarajevo', 'Bosna i Hercegovina', '1977-11-26', 48, 332, 2018, '2485581', '101570', 'https://my.divessi.com/data/user_files/2/4/8/5/5/8/1/pic/2485581.png?1766333929', NULL, 'Adisa Kozadra', 'Spouse', '38761303426', 'active', 'user', NOW(), NOW()),
  ('Anida Bejdjakic', 'b.anida@hotmail.com', '38761595495', 'Dzemala Bijedica 160', '71000 Sarajevo', 'Bosna i Hercegovina', '1988-07-30', 37, 43, 2025, '4486516', NULL, 'https://my.divessi.com/data/user_files/4/4/8/6/5/1/6/pic/4486516.png?1766333983', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Dora Kisic', 'dorakisic7@gmail.com', '38598615651', 'Bulet 17, 20235 Zaton Veliki', '20235 Zaton Veliki', 'Hrvatska', '1999-06-11', 26, 69, 2022, '3943030', NULL, 'https://my.divessi.com/data/user_files/3/9/4/3/0/3/0/pic/3943030.png?1766334027', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Elmedina Maljevic Suljic', 'm.elmedina@hotmail.com', '38761358910', 'Breka 140', '71000 Sarajevo', 'Bosna i Hercegovina', '1978-02-03', 47, 155, 2024, '4104849', NULL, 'https://my.divessi.com/data/user_files/4/1/0/4/8/4/9/pic/4104849.png?1766334124', NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Davor Mulalic', 'mulalic71@gmail.com', '38761787331', 'Mehmeda Spahe 4', '71000 Sarajevo', 'Bosna i Hercegovina', '1971-09-21', 54, 1030, 2000, '2787309', '95720', 'https://my.divessi.com/data/user_files/2/7/8/7/3/0/9/pic/2787309.png?1766334172', NULL, 'Amela Mulalić', 'Spouse', '38761615342', 'active', 'admin', NOW(), NOW()),
  ('Adnan Drnda', 'adnandrnda@hotmail.com', '38762332082', 'Marka Marulica 3', '71000 Sarajevo', 'Bosna i Hercegovina', '1970-02-15', 55, 1267, 2009, '2438732', '83562', 'https://my.divessi.com/data/user_files/2/4/3/8/7/3/2/pic/2438732.png?1766334235', 'No fish', 'Maja Drnda', 'Spouse', '38761360322', 'active', 'admin', NOW(), NOW()),
  ('Samir Solakovic', 'samirso@hotmail.com', '38761263651', 'Trg grada Prato', '71000 Sarajevo', 'Bosna i Hercegovina', '1967-01-27', 58, 1007, 2021, '2438727', '83563', 'https://my.divessi.com/data/user_files/2/4/3/8/7/2/7/pic/2438727.png?1766334288', NULL, 'Samra Solaković', 'Spouse', '38761835575', 'active', 'admin', NOW(), NOW()),
  ('Nermin Skula', 'skulary@hotmail.com', '38761575242', 'Adema Hubijara 5', '71000 Sarajevo', 'Bosna i Hercegovina', '1978-02-20', 47, 225, 2023, '3713013', '118012', 'https://my.divessi.com/data/user_files/3/7/1/3/0/1/3/pic/3713013.png?1766334332', NULL, 'Anida Bejdjakic', 'Contact', '38761595495', 'active', 'user', NOW(), NOW()),
  ('NeXo', 'nexo@divessisystem.local', '38761324599', NULL, '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Adisa Kozadra', 'adisa.kozadra@divessisystem.local', '38761303426', 'Muje Sejte 93', '71000 Sarajevo', 'Bosna i Hercegovina', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Dijete 1', 'dijete1@divessisystem.local', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Dijete 2', 'dijete2@divessisystem.local', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Dijete 3', 'dijete3@divessisystem.local', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW()),
  ('Dijete 4', 'dijete4@divessisystem.local', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 'user', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
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
  dietary_restrictions = EXCLUDED.dietary_restrictions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  status = EXCLUDED.status,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify ronjači inserted
SELECT COUNT(*) as ronjaci_count FROM users WHERE email IS NOT NULL AND name NOT IN ('Dijete 1', 'Dijete 2', 'Dijete 3', 'Dijete 4');
SELECT name, email, status, role FROM users WHERE email IS NOT NULL ORDER BY name;

-- ===========================================
-- STEP 3: Create/Insert payments
-- ===========================================

-- Drop and recreate payments table with correct schema
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  diver_name TEXT NOT NULL,
  paid_to_agency NUMERIC(10,2) DEFAULT 0,
  paid_to_adnana NUMERIC(10,2) DEFAULT 0,
  add_for_kids NUMERIC(10,2) DEFAULT 0,
  payment_date DATE,
  payment_purpose TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert payment data
INSERT INTO payments (
  user_id,
  diver_name,
  paid_to_agency,
  paid_to_adnana,
  add_for_kids,
  payment_date,
  payment_purpose,
  note
) VALUES
  ((SELECT id FROM users WHERE name = 'Zahida Ademovic' LIMIT 1), 'Zahida Ademovic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', 'Dodatne informacije o popustima ili ratama.'),
  ((SELECT id FROM users WHERE name = 'Omer Merzic' LIMIT 1), 'Omer Merzic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Naida Haracic' LIMIT 1), 'Naida Haracic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Emir Haracic' LIMIT 1), 'Emir Haracic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Muammer Mrahorovic' LIMIT 1), 'Muammer Mrahorovic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Midhat Kozadra' LIMIT 1), 'Midhat Kozadra', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Anida Bejdjakic' LIMIT 1), 'Anida Bejdjakic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Dora Kisic' LIMIT 1), 'Dora Kisic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Elmedina Maljevic Suljic' LIMIT 1), 'Elmedina Maljevic Suljic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Davor Mulalic' LIMIT 1), 'Davor Mulalic', 0, 0, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Adnan Drnda' LIMIT 1), 'Adnan Drnda', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Samir Solakovic' LIMIT 1), 'Samir Solakovic', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Nermin Skula' LIMIT 1), 'Nermin Skula', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'NeXo' LIMIT 1), 'NeXo', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Adisa Kozadra' LIMIT 1), 'Adisa Kozadra', 925, 915, 0, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Dijete 1' LIMIT 1), 'Dijete 1', 0, 0, 150, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Dijete 2' LIMIT 1), 'Dijete 2', 0, 0, 150, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Dijete 3' LIMIT 1), 'Dijete 3', 0, 0, 150, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  ((SELECT id FROM users WHERE name = 'Dijete 4' LIMIT 1), 'Dijete 4', 0, 0, 150, '2025-12-20', 'Predračun br. 916/12-25', NULL)
ON CONFLICT DO NOTHING;

-- Verify payments inserted
SELECT COUNT(*) as payments_count FROM payments;
SELECT diver_name, paid_to_agency, paid_to_adnana, add_for_kids FROM payments ORDER BY diver_name;

-- ===========================================
-- STEP 4: Verify administrators set
-- ===========================================

SELECT id, name, role, email FROM users WHERE role = 'admin';

-- Expected admins: Davor Mulalic, Adnan Drnda, Samir Solakovic

-- ===========================================
-- STEP 5: Summary
-- ===========================================

SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT SUM(paid_to_agency) FROM payments) as total_paid_agency,
  (SELECT SUM(paid_to_adnana) FROM payments) as total_paid_adnana,
  (SELECT SUM(add_for_kids) FROM payments) as total_kids_fee;

-- ===========================================
-- SUCCESS!
-- ===========================================

-- ✅ All divers inserted
-- ✅ All payments recorded
-- ✅ Administrators set: Davor, Adnan, Samir
-- ✅ Ready for app!
