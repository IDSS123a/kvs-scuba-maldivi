# Fix: Add Missing PIN Fields to Database

The `divers` table is missing the fields needed for PIN authentication: `access_status` and `access_pin_hash`.

## Solution: Add Missing Columns

**Run this SQL in Supabase SQL Editor:**

```sql
-- Add missing columns for PIN authentication
ALTER TABLE divers 
ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS access_pin_hash TEXT;

-- Add enum type for access_status if needed
-- CREATE TYPE access_status AS ENUM ('pending', 'approved', 'rejected');

-- Then add you as admin with a PIN
INSERT INTO divers (name, email, is_pro, status, access_status, access_pin_hash)
VALUES (
  'Davor Mulalić',
  'mulalic71@gmail.com',
  true,
  'confirmed',
  'approved',
  crypt('123456', gen_salt('bf'))
)
ON CONFLICT (name) DO UPDATE SET
  email = EXCLUDED.email,
  is_pro = true,
  status = 'confirmed',
  access_status = 'approved',
  access_pin_hash = EXCLUDED.access_pin_hash;
```

## Then Login:

1. Click **Refresh** (F5)
2. Enter PIN: **123456**
3. Click **🔐 Unlock**
4. You should now be logged in as admin!

---

## What This Does:

✅ Adds `access_status` column (tracks if user is approved)  
✅ Adds `access_pin_hash` column (stores hashed PIN)  
✅ Adds you with PIN 123456 (hashed with bcrypt)  
✅ Sets your status to 'approved' (allows login)  

---

## If You Get an Error:

If you get "column already exists" - that's fine, it means the columns are already there. Just run the INSERT part:

```sql
INSERT INTO divers (name, email, is_pro, status, access_status, access_pin_hash)
VALUES (
  'Davor Mulalić',
  'mulalic71@gmail.com',
  true,
  'confirmed',
  'approved',
  crypt('123456', gen_salt('bf'))
)
ON CONFLICT (name) DO UPDATE SET
  email = EXCLUDED.email,
  is_pro = true,
  status = 'confirmed',
  access_status = 'approved',
  access_pin_hash = EXCLUDED.access_pin_hash;
```

---

**Total time: 2 minutes** ⏱️
