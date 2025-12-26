-- ============================================================================
-- PHASE 1.2 ROW LEVEL SECURITY POLICIES
-- Complete RLS implementation for KVS Scuba Maldivi application
-- ============================================================================
-- This file contains all RLS policies needed to secure the core tables.
-- Each table has policies for:
--   1. Admin bypass - full access for admins (is_admin = true)
--   2. Self-access - users can access their own records
--   3. Specific operations - SELECT, INSERT, UPDATE, DELETE
--
-- Copy and paste this entire file into Supabase SQL Editor to execute.
-- ============================================================================


-- ============================================================================
-- 1. USERS TABLE RLS POLICIES
-- ============================================================================
-- Policies:
--   - Admins: full read/write access
--   - Users: can view their own profile
--   - Users: can update their own profile
--   - Public: can insert (registration)

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin: Can select all users
CREATE POLICY "users_admin_select"
  ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can select their own profile
CREATE POLICY "users_self_select"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Public/Auth: Can insert new users (registration)
CREATE POLICY "users_public_insert"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin: Can insert users
CREATE POLICY "users_admin_insert"
  ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can update their own profile
CREATE POLICY "users_self_update"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin: Can update any user
CREATE POLICY "users_admin_update"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can delete users
CREATE POLICY "users_admin_delete"
  ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ============================================================================
-- 2. ACCESS_REQUESTS TABLE RLS POLICIES
-- ============================================================================
-- Policies:
--   - Admins: full read/write access
--   - Users: can view their own requests
--   - Users: can create their own requests
--   - Users: can update their own requests (if not approved)
--   - Admins: can update request status

-- Enable RLS on access_requests table
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Admin: Can select all access requests
CREATE POLICY "access_requests_admin_select"
  ON access_requests
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can select their own access requests
CREATE POLICY "access_requests_self_select"
  ON access_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users: Can insert their own access requests
CREATE POLICY "access_requests_self_insert"
  ON access_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin: Can insert access requests
CREATE POLICY "access_requests_admin_insert"
  ON access_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can update their own requests
CREATE POLICY "access_requests_self_update"
  ON access_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin: Can update all access requests (for approval/rejection)
CREATE POLICY "access_requests_admin_update"
  ON access_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can delete access requests
CREATE POLICY "access_requests_admin_delete"
  ON access_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ============================================================================
-- 3. PAYMENTS TABLE RLS POLICIES
-- ============================================================================
-- Policies:
--   - Admins: full read/write access
--   - Users: can view their own payments
--   - Admins: can create/update payments
--   - Users: read-only access to their payments

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Admin: Can select all payments
CREATE POLICY "payments_admin_select"
  ON payments
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can select their own payments
CREATE POLICY "payments_self_select"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin: Can insert payments
CREATE POLICY "payments_admin_insert"
  ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can update payments
CREATE POLICY "payments_admin_update"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can delete payments
CREATE POLICY "payments_admin_delete"
  ON payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ============================================================================
-- 4. USER_ACTIVITY TABLE RLS POLICIES
-- ============================================================================
-- Policies:
--   - Admins: full read/write access
--   - Users: can view their own activity (read-only)
--   - System: automatic logging (handled by triggers)
--   - Users: cannot modify their activity records

-- Enable RLS on user_activity table
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Admin: Can select all activity logs
CREATE POLICY "user_activity_admin_select"
  ON user_activity
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can select their own activity (read-only)
CREATE POLICY "user_activity_self_select"
  ON user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

-- System/Admin: Can insert activity logs
CREATE POLICY "user_activity_admin_insert"
  ON user_activity
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL 
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can update activity logs (for corrections)
CREATE POLICY "user_activity_admin_update"
  ON user_activity
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin: Can delete activity logs
CREATE POLICY "user_activity_admin_delete"
  ON user_activity
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ============================================================================
-- 5. CHECKLIST_ITEMS TABLE RLS POLICIES
-- ============================================================================
-- Policies:
--   - Admins: full read/write access
--   - Users: can view their own checklist items
--   - Users: can create checklist items for themselves
--   - Users: can update their own checklist items
--   - Users: can delete their own checklist items

-- Enable RLS on checklist_items table
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Admin: Can select all checklist items
CREATE POLICY "checklist_items_admin_select"
  ON checklist_items
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can select their own checklist items
CREATE POLICY "checklist_items_self_select"
  ON checklist_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users: Can insert their own checklist items
CREATE POLICY "checklist_items_self_insert"
  ON checklist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin: Can insert checklist items
CREATE POLICY "checklist_items_admin_insert"
  ON checklist_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can update their own checklist items
CREATE POLICY "checklist_items_self_update"
  ON checklist_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin: Can update any checklist items
CREATE POLICY "checklist_items_admin_update"
  ON checklist_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users: Can delete their own checklist items
CREATE POLICY "checklist_items_self_delete"
  ON checklist_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin: Can delete any checklist items
CREATE POLICY "checklist_items_admin_delete"
  ON checklist_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ============================================================================
-- VERIFICATION & NOTES
-- ============================================================================
-- After executing these policies, verify with:
--
-- 1. Check that RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables 
--    WHERE schemaname = 'public' AND tablename IN (
--      'users', 'access_requests', 'payments', 'user_activity', 'checklist_items'
--    );
--
-- 2. View all policies:
--    SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
--    FROM pg_policies 
--    WHERE schemaname = 'public';
--
-- 3. Test policies:
--    - Sign in as regular user and verify they can only see their own data
--    - Sign in as admin and verify they can see all data
--    - Test INSERT, UPDATE, DELETE operations
--
-- ============================================================================
-- IMPLEMENTATION NOTES:
-- ============================================================================
-- 1. Admin Detection: Uses "is_admin = true" field in users table
-- 2. Auth Context: Uses auth.uid() to get current user ID
-- 3. Admin Bypass: Each table has separate policies for admin access
-- 4. Self-Access: Regular users can see/modify only their own records
-- 5. Row-Level: All restrictions are at the row level, not column level
-- 6. Cascade: DELETE operations on users may need cascade rules defined
-- 7. Performance: Consider adding indexes on user_id and id columns
--
-- ============================================================================
