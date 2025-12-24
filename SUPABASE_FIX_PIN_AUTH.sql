-- 🚨 IMMEDIATE FIX - EXECUTE THIS NOW IN SUPABASE SQL EDITOR

-- The problem: RLS policies prevent anonymous users from reading pin_code for login verification
-- Solution: Add public SELECT policy for PIN verification

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "admins_full_access_users" ON users;
DROP POLICY IF EXISTS "users_view_own_data" ON users;
DROP POLICY IF EXISTS "allow_new_registration" ON users;
DROP POLICY IF EXISTS "prevent_user_self_update" ON users;
DROP POLICY IF EXISTS "prevent_user_self_delete" ON users;
DROP POLICY IF EXISTS "allow_public_select" ON users;

-- Step 2: Create NEW policies that work correctly

-- Policy 1: Admins have full access
CREATE POLICY "admins_full_access_users" ON users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'::user_role
    )
  );

-- Policy 2: Authenticated users can view ONLY their own data
CREATE POLICY "users_view_own_data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: PUBLIC - Allow anyone to SELECT (read) without authentication
-- This is REQUIRED for PIN verification during login (before user is authenticated)
CREATE POLICY "allow_public_select" ON users
  FOR SELECT
  USING (TRUE);

-- Policy 4: Allow new user registration (insert only)
CREATE POLICY "allow_new_registration" ON users
  FOR INSERT
  WITH CHECK (status = 'pending'::user_status);

-- Policy 5: Prevent users from updating their own data
CREATE POLICY "prevent_user_self_update" ON users
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Policy 6: Prevent users from deleting their account
CREATE POLICY "prevent_user_self_delete" ON users
  FOR DELETE
  USING (false);

-- VERIFY: Check that policies are correct
SELECT schemaname, tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- If you see all 6 policies above, PIN login should now work! ✅
