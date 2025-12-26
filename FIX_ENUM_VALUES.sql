-- FIX INVALID ENUM VALUES IN DATABASE
-- Run this in Supabase SQL Editor to permanently fix old status values

-- Update all 'confirmed' status to 'active'
UPDATE public.users 
SET status = 'active' 
WHERE status = 'confirmed';

-- Update all 'cancelled' status to 'rejected' 
UPDATE public.users 
SET status = 'rejected' 
WHERE status = 'cancelled';

-- Verify the fix
SELECT status, COUNT(*) as count
FROM public.users
GROUP BY status
ORDER BY status;

-- Expected valid statuses: 'pending', 'active', 'approved', 'rejected'
