-- Set admin recovery PIN (999999) for all admin users

UPDATE users 
SET pin_code = '999999' 
WHERE role = 'admin'::user_role;

-- Verify
SELECT id, name, email, role, status, pin_code FROM users WHERE role = 'admin';
