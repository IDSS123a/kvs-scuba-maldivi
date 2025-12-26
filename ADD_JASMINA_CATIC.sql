-- SQL Script to add Jasmina Catic to the participants list
-- Copy and Paste this into your Supabase SQL Editor

INSERT INTO public.users (
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
  photo_url, 
  status, 
  role,
  is_diver,
  is_pro,
  created_at, 
  updated_at
) VALUES (
  'Jasmina Catic', 
  'jasmina.catic7@gmail.com', 
  '+387061324599', 
  'Mocila 28', 
  '71240 Hadzici', 
  'Bosna i Hercegovina', 
  '1972-06-03', 
  53, 
  28, 
  2024, 
  '4328289', 
  'https://my.divessi.com/data/user_files/4/3/2/8/2/8/9/pic/4328289.png?1766755276', 
  'active', 
  'member',
  true,
  false,
  NOW(), 
  NOW()
) ON CONFLICT (email) DO UPDATE SET
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
  photo_url = EXCLUDED.photo_url,
  status = EXCLUDED.status,
  role = EXCLUDED.role,
  is_diver = EXCLUDED.is_diver,
  is_pro = EXCLUDED.is_pro,
  updated_at = NOW();

-- Verification
SELECT name, email, status, role FROM public.users WHERE email = 'jasmina.catic7@gmail.com';
