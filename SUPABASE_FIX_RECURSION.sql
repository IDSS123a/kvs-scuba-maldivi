-- Fix infinite recursion in RLS policies
-- Drop all existing policies on users table
DROP POLICY IF EXISTS "admins_full_access_users" ON public.users;
DROP POLICY IF EXISTS "users_view_own_data" ON public.users;
DROP POLICY IF EXISTS "allow_public_select" ON public.users;
DROP POLICY IF EXISTS "allow_new_registration" ON public.users;
DROP POLICY IF EXISTS "prevent_user_self_update" ON public.users;
DROP POLICY IF EXISTS "prevent_user_self_delete" ON public.users;

-- Recreate policies WITHOUT recursion
-- 1. Allow public SELECT for PIN verification (no recursion - just returns data)
CREATE POLICY "allow_public_select" ON public.users
FOR SELECT
TO public
USING (TRUE);

-- 2. Allow anyone (public) to INSERT with status='pending'
CREATE POLICY "allow_new_registration" ON public.users
FOR INSERT
WITH CHECK (status = 'pending'::user_status);

-- 3. Allow authenticated users to view their own data only
CREATE POLICY "users_view_own_data" ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

-- 4. Allow service role (bypasses RLS) - will be used by backend
-- Note: Service role has full access automatically, doesn't need explicit policy

-- 5. Admin policy using email check instead of recursive table query
-- This prevents infinite recursion by checking email directly against known admin emails
-- Admins can SELECT all rows
CREATE POLICY "admin_select_all" ON public.users
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'mulalic71@gmail.com',
    'adnandrnda@hotmail.com', 
    'samirso@hotmail.com'
  )
);

-- Admins can INSERT and UPDATE all rows
CREATE POLICY "admin_insert_update_all" ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'mulalic71@gmail.com',
    'adnandrnda@hotmail.com',
    'samirso@hotmail.com'
  )
);

CREATE POLICY "admin_update_all" ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'mulalic71@gmail.com',
    'adnandrnda@hotmail.com', 
    'samirso@hotmail.com'
  )
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'mulalic71@gmail.com',
    'adnandrnda@hotmail.com',
    'samirso@hotmail.com'
  )
);

-- Admins can DELETE all rows
CREATE POLICY "admin_delete_all" ON public.users
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'mulalic71@gmail.com',
    'adnandrnda@hotmail.com', 
    'samirso@hotmail.com'
  )
);

-- 6. Prevent regular users from updating themselves
CREATE POLICY "prevent_user_self_update" ON public.users
FOR UPDATE
TO authenticated
USING (FALSE)
WITH CHECK (FALSE);

-- 7. Prevent regular users from deleting themselves
CREATE POLICY "prevent_user_self_delete" ON public.users
FOR DELETE
TO authenticated
USING (FALSE);

-- Enable RLS on users table (should already be enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
