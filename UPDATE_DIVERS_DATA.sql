-- ========================================
-- AŽURIRANJE PODATAKA O RONIOCIMA U USERS TABELI (SA STATUSOM)
-- ========================================

-- 1. Zahida Ademovic
UPDATE public.users SET
    phone = '38761898860',
    address = 'Grbavicka 3',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1969-05-17',
    age = 56,
    total_dives = 115,
    start_year = 2022,
    master_id = '3930758',
    photo_url = 'https://my.divessi.com/data/user_files/3/9/3/0/7/5/8/pic/3930758.png?1766333312',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'zaadbos@gmail.com';

-- 2. Omer Merzic
UPDATE public.users SET
    phone = '38762226988',
    address = 'Milana Preloga 19',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1997-03-07',
    age = 28,
    total_dives = 45,
    start_year = 2023,
    master_id = '3905400',
    photo_url = 'https://my.divessi.com/data/user_files/3/9/0/5/4/0/0/pic/3905400.png?1766333450',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'omer.merzic@gmail.com';

-- 3. Naida Haracic
UPDATE public.users SET
    phone = '38761686044',
    address = 'Soukbunar 1',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1981-01-12',
    age = 44,
    total_dives = 32,
    start_year = 2025,
    master_id = '4478426',
    photo_url = 'https://my.divessi.com/data/user_files/4/4/7/8/4/2/6/pic/4478426.png?1766333761',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'naida@sportsport.ba';

-- 4. Emir Haracic
UPDATE public.users SET
    phone = '38762244017',
    address = 'Soukbunar 1',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1979-01-21',
    age = 46,
    total_dives = 42,
    start_year = 2025,
    master_id = '4478415',
    photo_url = 'https://my.divessi.com/data/user_files/4/4/7/8/4/1/5/pic/4478415.png?1766333812',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'emir@sportsport.ba';

-- 5. Muammer Mrahorovic
UPDATE public.users SET
    phone = '38762183344',
    address = 'Srdjana Aleksica 22 / InteaBH d.o.o.',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1975-05-02',
    age = 50,
    total_dives = 266,
    start_year = 2023,
    master_id = '3899956',
    ssi_pro_id = '117803',
    photo_url = 'https://my.divessi.com/data/user_files/3/8/9/9/9/5/6/pic/3899956.png?1766333881',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'muammerm@gmail.com';

-- 6. Midhat Kozadra
UPDATE public.users SET
    phone = '38761898727',
    address = 'Muje Sejte 93',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1977-11-26',
    age = 48,
    total_dives = 332,
    start_year = 2018,
    master_id = '2485581',
    ssi_pro_id = '101570',
    photo_url = 'https://my.divessi.com/data/user_files/2/4/8/5/5/8/1/pic/2485581.png?1766333929',
    dietary_restriction = 'None',
    emergency_contact_name = 'Adisa Kozadra',
    emergency_contact_relationship = 'Spouse',
    emergency_contact_phone = '38761303426',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'mido.kozadra@gmail.com';

-- 7. Anida Bejdjakic
UPDATE public.users SET
    phone = '38761595495',
    address = 'Dzemala Bijedica 160',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1988-07-30',
    age = 37,
    total_dives = 43,
    start_year = 2025,
    master_id = '4486516',
    photo_url = 'https://my.divessi.com/data/user_files/4/4/8/6/5/1/6/pic/4486516.png?1766333983',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'b.anida@hotmail.com';

-- 8. Dora Kisic
UPDATE public.users SET
    phone = '38598615651',
    address = 'Bulet 17, 20235 Zaton Veliki',
    city = '20235 Zaton Veliki',
    country = 'Hrvatska',
    birth_date = '1999-06-11',
    age = 26,
    total_dives = 69,
    start_year = 2022,
    master_id = '3943030',
    photo_url = 'https://my.divessi.com/data/user_files/3/9/4/3/0/3/0/pic/3943030.png?1766334027',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'dorakisic7@gmail.com';

-- 9. Elmedina Maljevic Suljic
UPDATE public.users SET
    phone = '38761358910',
    address = 'Breka 140',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1978-02-03',
    age = 47,
    total_dives = 155,
    start_year = 2024,
    master_id = '4104849',
    photo_url = 'https://my.divessi.com/data/user_files/4/1/0/4/8/4/9/pic/4104849.png?1766334124',
    dietary_restriction = 'None',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'm.elmedina@hotmail.com';

-- 10. Davor Mulalic
UPDATE public.users SET
    phone = '38761787331',
    address = 'Mehmeda Spahe 4',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1971-09-21',
    age = 54,
    total_dives = 1030,
    start_year = 2000,
    master_id = '2787309',
    ssi_pro_id = '95720',
    photo_url = 'https://my.divessi.com/data/user_files/2/7/8/7/3/0/9/pic/2787309.png?1766334172',
    dietary_restriction = 'None',
    emergency_contact_name = 'Amela Mulalić',
    emergency_contact_relationship = 'Spouse',
    emergency_contact_phone = '38761615342',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'mulalic71@gmail.com';

-- 11. Adnan Drnda
UPDATE public.users SET
    phone = '38762332082',
    address = 'Marka Marulica 3',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1970-02-15',
    age = 55,
    total_dives = 1267,
    start_year = 2009,
    master_id = '2438732',
    ssi_pro_id = '83562',
    photo_url = 'https://my.divessi.com/data/user_files/2/4/3/8/7/3/2/pic/2438732.png?1766334235',
    dietary_restriction = 'No fish',
    emergency_contact_name = 'Maja Drnda',
    emergency_contact_relationship = 'Spouse',
    emergency_contact_phone = '38761360322',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'adnandrnda@hotmail.com';

-- 12. Samir Solakovic
UPDATE public.users SET
    phone = '38761263651',
    address = 'Trg grada Prato',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1967-01-27',
    age = 58,
    total_dives = 1007,
    start_year = 2021,
    master_id = '2438727',
    ssi_pro_id = '83563',
    photo_url = 'https://my.divessi.com/data/user_files/2/4/3/8/7/2/7/pic/2438727.png?1766334288',
    dietary_restriction = 'None',
    emergency_contact_name = 'Samra Solaković',
    emergency_contact_relationship = 'Spouse',
    emergency_contact_phone = '38761835575',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'samirso@hotmail.com';

-- 13. Nermin Skula
UPDATE public.users SET
    phone = '38761575242',
    address = 'Adema Hubijara 5',
    city = '71000 Sarajevo',
    country = 'Bosna i Hercegovina',
    birth_date = '1978-02-20',
    age = 47,
    total_dives = 225,
    start_year = 2023,
    master_id = '3713013',
    ssi_pro_id = '118012',
    photo_url = 'https://my.divessi.com/data/user_files/3/7/1/3/0/1/3/pic/3713013.png?1766334332',
    dietary_restriction = 'None',
    emergency_contact_name = 'Anida Bejdjakic',
    emergency_contact_relationship = '-',
    emergency_contact_phone = '38761595495',
    is_diver = true,
    status = 'confirmed'
WHERE email = 'skulary@hotmail.com';
