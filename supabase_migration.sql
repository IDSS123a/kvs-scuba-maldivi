-- KVS-SCUBA Maldives 2026 Database Schema
-- This migration creates the core tables for the expedition management system

-- Create ENUM types
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE payment_method AS ENUM ('agency', 'cash');
CREATE TYPE diver_status AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE gallery_category AS ENUM ('dive', 'group', 'meal', 'fun', 'other');

-- Divers table (Expedition participants)
CREATE TABLE divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date TEXT,
  age INTEGER,
  total_dives INTEGER DEFAULT 0,
  start_year INTEGER,
  is_pro BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  dietary_restrictions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  status diver_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Track expedition payments)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID NOT NULL REFERENCES divers(id) ON DELETE CASCADE,
  amount_eur NUMERIC(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_date DATE,
  status payment_status DEFAULT 'pending',
  notes TEXT,
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
  category gallery_category DEFAULT 'other',
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
CREATE INDEX idx_payments_diver_id ON payments(diver_id);
CREATE INDEX idx_payments_status ON payments(status);
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

-- Public read access to divers and itinerary (for non-sensitive data)
CREATE POLICY "divers_public_read" ON divers
  FOR SELECT USING (true);

CREATE POLICY "itinerary_public_read" ON itinerary
  FOR SELECT USING (true);

-- Gallery: public read
CREATE POLICY "gallery_public_read" ON gallery
  FOR SELECT USING (true);

-- Payments: admin only (implement auth check)
CREATE POLICY "payments_authenticated_read" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "payments_authenticated_insert" ON payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert sample itinerary data (first 3 days as example)
INSERT INTO itinerary (day, date, title, description, type, location, details) VALUES
  (1, 'Jan 5', 'Polazak i Dolazak', 'Let SJJ-IST (15:30), presjedanje na IST-MLE. Dolazak na Maafushi, smještaj i briefing u dive centru.', 'Flight', 'Maafushi', 
    '{"flights": [{"from": "Sarajevo (SJJ)", "to": "Istanbul (IST)", "time": "15:30"}, {"from": "Istanbul (IST)", "to": "Male (MLE)", "time": "TBD"}], "activity": "Arrival and settlement"}'),
  
  (2, 'Jan 6', 'Maafushi Caves Explore', 'Spektakularne podvodne špilje i noćni dive opcija.', 'Dive', 'Maafushi Caves',
    '{"dives": [{"site": "Maafushi Caves", "depth_m": "~30", "visibility_m": "15-30", "difficulty": "srednji-napredni"}, {"site": "Maafushi Lagoon Night", "depth_m": "2-3", "visibility_m": "15-20", "difficulty": "početnički-srednji"}]}'),
  
  (3, 'Jan 7', 'Guraidhoo Corner', 'Impresivni zidovi i bogat pelagični život.', 'Dive', 'Guraidhoo Corner',
    '{"dives": [{"site": "Guraidhoo Corner", "depth_m": "~30", "visibility_m": "15-30", "difficulty": "srednji-napredni", "marine_life": ["grey reef sharks", "eagle rays", "jacks"]}]}');
