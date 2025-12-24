-- DROP existing tables with CASCADE to clear schema conflicts
-- WARNING: This will delete all data. Back up first if needed.

DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS itinerary CASCADE;
DROP TABLE IF EXISTS divers CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS gallery_category;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS diver_status;

-- Now create fresh tables with correct schema
-- =============================================================================

-- Create ENUM types
CREATE TYPE diver_status AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE payment_method AS ENUM ('agency', 'cash');
CREATE TYPE gallery_category AS ENUM ('dive', 'group', 'meal', 'fun', 'other');

-- Divers table (Expedition participants)
CREATE TABLE divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  birth_date TEXT,
  age INTEGER,
  total_dives INTEGER DEFAULT 0,
  start_year INTEGER,
  is_pro BOOLEAN DEFAULT false,
  photo_url TEXT,
  dietary_restrictions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  status diver_status DEFAULT 'pending'::diver_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Track expedition payments)
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  paid_to_agency NUMERIC(10, 2) DEFAULT 0,
  paid_to_adnan NUMERIC(10, 2) DEFAULT 0,
  add_for_kids NUMERIC(10, 2) DEFAULT 0,
  payment_date DATE,
  payment_purpose TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table (Trip photos and media)
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category gallery_category DEFAULT 'other'::gallery_category,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itinerary table (Expedition schedule and dive details)
CREATE TABLE itinerary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INTEGER NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  location TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_divers_email ON divers(email);
CREATE INDEX idx_divers_status ON divers(status);
CREATE INDEX idx_payments_name ON payments(name);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_gallery_diver_id ON gallery(diver_id);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_itinerary_day ON itinerary(day);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_divers_updated_at BEFORE UPDATE ON divers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_updated_at BEFORE UPDATE ON itinerary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE divers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access to non-sensitive data
CREATE POLICY "divers_public_read" ON divers
  FOR SELECT USING (true);

CREATE POLICY "itinerary_public_read" ON itinerary
  FOR SELECT USING (true);

CREATE POLICY "gallery_public_read" ON gallery
  FOR SELECT USING (true);

CREATE POLICY "payments_public_read" ON payments
  FOR SELECT USING (true);

-- Insert sample itinerary data (first 3 days)
INSERT INTO itinerary (day, date, title, description, type, location, details) VALUES
  (1, 'Jan 5', 'Polazak i Dolazak', 'Let SJJ-IST (15:30), presjedanje na IST-MLE. Dolazak na Maafushi, smještaj i briefing u dive centru.', 'Flight', 'Maafushi', 
    '{"flights": [{"from": "Sarajevo (SJJ)", "to": "Istanbul (IST)", "time": "15:30"}, {"from": "Istanbul (IST)", "to": "Male (MLE)", "time": "TBD"}], "activity": "Arrival and settlement"}'),
  
  (2, 'Jan 6', 'Maafushi Caves Explore', 'Spektakularne podvodne špilje i noćni dive opcija.', 'Dive', 'Maafushi Caves',
    '{"dives": [{"site": "Maafushi Caves", "depth_m": "~30", "visibility_m": "15-30", "difficulty": "srednji-napredni"}, {"site": "Maafushi Lagoon Night", "depth_m": "2-3", "visibility_m": "15-20", "difficulty": "početnički-srednji"}]}'),
  
  (3, 'Jan 7', 'Guraidhoo Corner', 'Impresivni zidovi i bogat pelagični život.', 'Dive', 'Guraidhoo Corner',
    '{"dives": [{"site": "Guraidhoo Corner", "depth_m": "~30", "visibility_m": "15-30", "difficulty": "srednji-napredni", "marine_life": ["grey reef sharks", "eagle rays", "jacks"]}]}');

-- Insert payment data from Finance sheet (1 record per participant)
INSERT INTO payments (id, name, paid_to_agency, paid_to_adnana, add_for_kids, payment_date, payment_purpose, note) VALUES
  (101, 'Zahida Ademovic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', 'Dodatne informacije o popustima ili ratama.'),
  (102, 'Omer Merzic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (103, 'Naida Haracic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (104, 'Emir Haracic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (105, 'Muammer Mrahorovic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (106, 'Midhat Kozadra', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (107, 'Anida Bejdjakic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (108, 'Dora Kisic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (109, 'Elmedina Maljevic Suljic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (110, 'Davor Mulalic', 0.00, 0.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (111, 'Adnan Drnda', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (112, 'Samir Solakovic', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (113, 'Nermin Skula', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (114, 'NeXo', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (115, 'Adisa Kozadra', 925.00, 915.00, 0.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (116, 'Dijete 1', 0.00, 0.00, 150.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (117, 'Dijete 2', 0.00, 0.00, 150.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (118, 'Dijete 3', 0.00, 0.00, 150.00, '2025-12-20', 'Predračun br. 916/12-25', NULL),
  (119, 'Dijete 4', 0.00, 0.00, 150.00, '2025-12-20', 'Predračun br. 916/12-25', NULL);

-- Insert actual expedition participants (19 total)
INSERT INTO divers (name, email, phone, birth_date, age, total_dives, start_year, is_pro, photo_url, dietary_restrictions, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, status) VALUES
  ('Zahida Ademovic', 'zaadbos@gmail.com', '38761898860', '17.05.1969', 56, 115, 2022, false, 'https://my.divessi.com/data/user_files/3/9/3/0/7/5/8/pic/3930758.png?1766333312', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Omer Merzic', 'omer.merzic@gmail.com', '38762226988', '07.03.1997', 28, 45, 2023, false, 'https://my.divessi.com/data/user_files/3/9/0/5/4/0/0/pic/3905400.png?1766333450', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Naida Haracic', 'naida@sportsport.ba', '38761686044', '12.01.1981', 44, 32, 2025, false, 'https://my.divessi.com/data/user_files/4/4/7/8/4/2/6/pic/4478426.png?1766333761', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Emir Haracic', 'emir@sportsport.ba', '38762244017', '21.01.1979', 46, 42, 2025, false, 'https://my.divessi.com/data/user_files/4/4/7/8/4/1/5/pic/4478415.png?1766333812', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Muammer Mrahorovic', 'muammerm@gmail.com', '38762183344', '02.05.1975', 50, 266, 2023, true, 'https://my.divessi.com/data/user_files/3/8/9/9/9/5/6/pic/3899956.png?1766333881', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Midhat Kozadra', 'mido.kozadra@gmail.com', '38761898727', '26.11.1977', 48, 332, 2018, true, 'https://my.divessi.com/data/user_files/2/4/8/5/5/8/1/pic/2485581.png?1766333929', NULL, 'Adisa Kozadra', 'Spouse', '38761303426', 'confirmed'),
  ('Anida Bejdjakic', 'b.anida@hotmail.com', '38761595495', '30.7.1988', 37, 43, 2025, false, 'https://my.divessi.com/data/user_files/4/4/8/6/5/1/6/pic/4486516.png?1766333983', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Dora Kisic', 'dorakisic7@gmail.com', '38598615651', '11.06.1999', 26, 69, 2022, false, 'https://my.divessi.com/data/user_files/3/9/4/3/0/3/0/pic/3943030.png?1766334027', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Elmedina Maljevic Suljic', 'm.elmedina@hotmail.com', '38761358910', '03.02.1978', 47, 155, 2024, false, 'https://my.divessi.com/data/user_files/4/1/0/4/8/4/9/pic/4104849.png?1766334124', NULL, NULL, NULL, NULL, 'confirmed'),
  ('Davor Mulalic', 'mulalic71@gmail.com', '38761787331', '21.09.1971', 54, 1030, 2000, true, 'https://my.divessi.com/data/user_files/2/7/8/7/3/0/9/pic/2787309.png?1766334172', NULL, 'Amela Mulalić', 'Spouse', '38761615342', 'confirmed'),
  ('Adnan Drnda', 'adnandrnda@hotmail.com', '38762332082', '15.02.1970', 55, 1267, 2009, true, 'https://my.divessi.com/data/user_files/2/4/3/8/7/3/2/pic/2438732.png?1766334235', 'No fish', 'Maja Drnda', 'Spouse', '38761360322', 'confirmed'),
  ('Samir Solakovic', 'samirso@hotmail.com', '38761263651', '27.01.1967', 58, 1007, 2021, true, 'https://my.divessi.com/data/user_files/2/4/3/8/7/2/7/pic/2438727.png?1766334288', NULL, 'Samra Solaković', 'Spouse', '38761835575', 'confirmed'),
  ('Nermin Skula', 'skulary@hotmail.com', '38761575242', '20.02.1978', 47, 225, 2023, true, 'https://my.divessi.com/data/user_files/3/7/1/3/0/1/3/pic/3713013.png?1766334332', NULL, 'Anida Bejdjakic', NULL, '38761595495', 'confirmed'),
  ('NeXo', NULL, '38761324599', NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending'),
  ('Adisa Kozadra', NULL, '38761303426', NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending'),
  ('Dijete 1', NULL, NULL, NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending'),
  ('Dijete 2', NULL, NULL, NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending'),
  ('Dijete 3', NULL, NULL, NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending'),
  ('Dijete 4', NULL, NULL, NULL, NULL, 0, NULL, false, NULL, NULL, NULL, NULL, NULL, 'pending');

