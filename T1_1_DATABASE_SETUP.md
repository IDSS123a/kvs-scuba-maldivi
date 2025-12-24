# PHASE 1, TASK T1.1: DATABASE SCHEMA SETUP

## Status: READY FOR EXECUTION

Two migration files have been created:
1. **supabase_auth_migration_simplified.sql** - RECOMMENDED (only adds missing columns)
2. **supabase_migration_auth_system.sql** - Complete version (with detailed comments)

## Current Divers Table Structure ✓

The `divers` table already contains:
- `id` (UUID) - Primary key
- `name` (TEXT)
- `email` (TEXT) - Unique
- `phone` (TEXT)
- `is_pro` (BOOLEAN) - **Already exists!** (indicates admin status)
- `status` (TEXT) - exists as 'confirmed', 'pending', etc.
- And 10 other columns for personal data

## What the Migration ADDS

1. **access_pin_hash** (TEXT) - Stores hashed 6-digit PIN for login
2. **access_status** (ENUM: 'pending', 'approved', 'revoked') - Access control status
3. **pin_created_at** (TIMESTAMP) - When PIN was generated
4. **last_login** (TIMESTAMP) - Track user activity
5. **admin_audit_log** table - Track all admin actions
6. **access_requests** table - Historical access request records
7. **Indexes** - For fast login lookups

## EXECUTION INSTRUCTIONS

### Step 1: Execute the Migration in Supabase

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project: **kvs-scuba-maldivi**
3. Navigate to **SQL Editor**
4. Click **"New Query"**
5. Copy the entire contents of `supabase_auth_migration_simplified.sql`
6. Paste it into the SQL editor
7. Click **"Run"** button (Ctrl+Enter)
8. Wait for completion - you should see "Success" message

### Step 2: Verify the Migration

After running, verify these changes:

```sql
-- Check that new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'divers' 
  AND column_name IN ('access_pin_hash', 'access_status', 'pin_created_at', 'last_login');

-- Expected result: 4 rows showing the new columns

-- Check that admin users are marked correctly
SELECT name, email, is_pro, access_status 
FROM divers 
WHERE email IN ('mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com');

-- Expected result: 3 rows with is_pro=true and access_status='approved'
```

### Step 3: Verify Tables Were Created

```sql
-- Check that audit and access_requests tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('admin_audit_log', 'access_requests');

-- Expected result: 2 rows
```

## After Migration Completion

Once verified, proceed to:
- **T1.2**: Build PIN-based authentication components (PinLogin, AccessRequestForm)
- **T1.3**: Build admin management dashboard (AdminDashboard)

## SECURITY NOTES

- PINs are stored as **hashed values only** (using bcryptjs in the app)
- Plain-text PINs are **never** stored in the database
- Admins will generate PINs through the app UI and relay them securely to users
- The system uses Supabase RLS policies to restrict access based on admin status

## Rollback Instructions (If Needed)

If you need to undo this migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;

-- Drop new columns from divers
ALTER TABLE divers 
DROP COLUMN IF EXISTS access_pin_hash,
DROP COLUMN IF EXISTS access_status,
DROP COLUMN IF EXISTS pin_created_at,
DROP COLUMN IF EXISTS last_login;

-- Drop enum type
DROP TYPE IF EXISTS status_type CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_divers_access_status;
DROP INDEX IF EXISTS idx_divers_email_access;
DROP INDEX IF EXISTS idx_divers_is_pro;
DROP INDEX IF EXISTS idx_divers_pin_hash;
```

---

**Next Action**: Execute the SQL migration in Supabase, then report back when complete. I will then proceed to T1.2 (Build authentication components).
