-- Fix audit table trigger issue
-- The update_updated_at_column trigger should only apply to users table, not audit table

-- Drop the incorrect trigger from audit table if it exists
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.access_requests_audit;

-- Ensure trigger only exists on users table
-- Drop all triggers on users table first
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON public.users;

-- Recreate trigger ONLY for users table
CREATE TRIGGER update_updated_at_column_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verify function exists (should already exist from migration)
-- If not, uncomment below:
/*
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/
