-- Step 1: Remove 999999 from EVERYONE
UPDATE users SET pin_code = NULL WHERE pin_code = '999999';

-- Step 2: See all admins
SELECT id, name, email, role FROM users WHERE role = 'admin'::user_role;

-- Step 3: Set 999999 for FIRST admin only (mulalic71@gmail.com)
UPDATE users 
SET pin_code = '999999' 
WHERE email = 'mulalic71@gmail.com' AND role = 'admin'::user_role;

-- Step 4: Verify
SELECT id, name, email, role, pin_code FROM users WHERE role = 'admin'::user_role;
