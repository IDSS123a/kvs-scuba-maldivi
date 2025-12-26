-- ============================================================================
-- MANDATE 4: EXPEDITION CHECKLIST - CREATE CHECKLIST_ITEMS TABLE
-- ============================================================================

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  mandatory BOOLEAN DEFAULT false,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_checklist_user_id ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_checklist_checked ON checklist_items(checked);

-- Enable RLS on checklist_items table
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own checklist items
DROP POLICY IF EXISTS "checklist_read_own" ON checklist_items;
CREATE POLICY "checklist_read_own" ON checklist_items
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to update their own checklist items
DROP POLICY IF EXISTS "checklist_update_own" ON checklist_items;
CREATE POLICY "checklist_update_own" ON checklist_items
  FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to insert their own checklist items
DROP POLICY IF EXISTS "checklist_insert_own" ON checklist_items;
CREATE POLICY "checklist_insert_own" ON checklist_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow admins to read all checklist items
DROP POLICY IF EXISTS "checklist_read_admin" ON checklist_items;
CREATE POLICY "checklist_read_admin" ON checklist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'::user_role
    )
  );

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_checklist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_checklist_timestamp ON checklist_items;
CREATE TRIGGER trigger_update_checklist_timestamp
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_timestamp();

-- ============================================================================
-- SEED DATA: Initial Checklist Items (Categories)
-- ============================================================================
-- Categories: Documents, Diving Equipment, Money, Health, Certifications
-- Note: These will be inserted for each user via application code or bulk insert

-- Insert sample data for testing (replace with actual user IDs)
-- SELECT uuid_generate_v4() to get a user ID first, then:
-- INSERT INTO checklist_items (user_id, category, name, description, mandatory) VALUES
-- (...);
