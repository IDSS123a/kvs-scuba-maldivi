-- ============================================================================
-- MANDATE 3: PAYMENTS TABLE FOR FINANCIAL TRACKING
-- ============================================================================

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_to_agency DECIMAL(10, 2) DEFAULT 0,
  amount_to_adnan DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read payments
DROP POLICY IF EXISTS "payments_read_policy" ON payments;
CREATE POLICY "payments_read_policy" ON payments
  FOR SELECT
  USING (true);

-- Allow admins to modify payments
DROP POLICY IF EXISTS "payments_admin_modify" ON payments;
CREATE POLICY "payments_admin_modify" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (
        SELECT id FROM users WHERE role = 'admin'::user_role LIMIT 1
      )
    )
  );

DROP POLICY IF EXISTS "payments_admin_update" ON payments;
CREATE POLICY "payments_admin_update" ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (
        SELECT id FROM users WHERE role = 'admin'::user_role LIMIT 1
      )
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_payments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_timestamp();
