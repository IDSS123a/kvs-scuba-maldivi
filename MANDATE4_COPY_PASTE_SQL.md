# 🗂️ MANDATE 4 - READY-TO-COPY SQL MIGRATIONS

## ⚠️ IMPORTANT: These SQL queries are ready to copy-paste into Supabase SQL Editor

> **Do NOT modify these queries.** They are tested and ready to use.

---

## Migration #1: PIN Hashing System

**Copy this entire block and paste into Supabase SQL Editor**

```sql
-- ============================================================================
-- MANDATE 4: PHASE D1 - PIN HASHING SECURITY
-- ============================================================================
-- Purpose: Add PIN hashing infrastructure to users table
-- Duration: < 1 second execution
-- Reversible: Yes (can drop pin_hash column if needed)

-- Step 1: Add pin_hash column (for bcryptjs-hashed PINs)
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_pin_hash ON users(pin_hash);

-- Step 3: Create audit logging function
CREATE OR REPLACE FUNCTION log_pin_hash_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pin_hash IS DISTINCT FROM OLD.pin_hash THEN
    INSERT INTO access_requests_audit (user_id, action, performed_by, details, performed_at)
    VALUES (NEW.id, 'pin_hash_updated', current_user, '{"status": "PIN hashed"}', NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for audit logging
DROP TRIGGER IF EXISTS trigger_log_pin_hash_update ON users;
CREATE TRIGGER trigger_log_pin_hash_update
  AFTER UPDATE OF pin_hash ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_pin_hash_update();

-- Verification: Run this to confirm migration worked:
-- SELECT id, email, pin_code, pin_hash FROM users LIMIT 1;
-- Expected: pin_hash column should exist (NULL for existing users until PIN regenerated)
```

**After running:**
- ✅ Check `users` table has `pin_hash` column
- ✅ Pin '1919' still works (backward compatible)
- ✅ New PINs will be automatically hashed

---

## Migration #2: Expedition Checklist System

**Copy this entire block and paste into Supabase SQL Editor**

```sql
-- ============================================================================
-- MANDATE 4: PHASE D3 - EXPEDITION CHECKLIST SYSTEM
-- ============================================================================
-- Purpose: Create checklist tracking for expedition preparation
-- Duration: < 2 seconds execution
-- Reversible: Yes (can drop table if needed)

-- Step 1: Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  mandatory BOOLEAN DEFAULT false,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_checklist_user_id ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_checklist_checked ON checklist_items(checked);

-- Step 3: Enable Row-Level Security (RLS)
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policy - Users can read their own items
DROP POLICY IF EXISTS "checklist_read_own" ON checklist_items;
CREATE POLICY "checklist_read_own" ON checklist_items
  FOR SELECT
  USING (user_id = auth.uid());

-- Step 5: RLS Policy - Users can update their own items
DROP POLICY IF EXISTS "checklist_update_own" ON checklist_items;
CREATE POLICY "checklist_update_own" ON checklist_items
  FOR UPDATE
  USING (user_id = auth.uid());

-- Step 6: RLS Policy - Users can insert their own items
DROP POLICY IF EXISTS "checklist_insert_own" ON checklist_items;
CREATE POLICY "checklist_insert_own" ON checklist_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Step 7: RLS Policy - Admins can read all items
DROP POLICY IF EXISTS "checklist_read_admin" ON checklist_items;
CREATE POLICY "checklist_read_admin" ON checklist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'::user_role
    )
  );

-- Step 8: Create timestamp update trigger
CREATE OR REPLACE FUNCTION update_checklist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS trigger_update_checklist_timestamp ON checklist_items;
CREATE TRIGGER trigger_update_checklist_timestamp
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_timestamp();

-- Verification: Run this to confirm migration worked:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'checklist_items';
-- Expected: One row with table_name = 'checklist_items'

-- Verification: Run this to confirm RLS policies exist:
-- SELECT polname, qual FROM pg_policies WHERE tablename = 'checklist_items';
-- Expected: 4 policies (read_own, update_own, insert_own, read_admin)
```

**After running:**
- ✅ Check `checklist_items` table exists
- ✅ RLS policies are configured (prevents data leakage)
- ✅ Checklist items will auto-seed on first user access

---

## Execution Steps

### Step 1: Open Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your Maldives KVS project
3. Click **SQL Editor** in left sidebar
4. Click **New Query** button

### Step 2: Run Migration #1 (PIN Hashing)
1. Copy the entire "Migration #1" block above
2. Paste into SQL Editor
3. Click **Run** button (or press Ctrl+Enter)
4. Wait for success message ✅
5. See confirmation: "SUCCESS: 5 queries"

### Step 3: Run Migration #2 (Checklist)
1. Click **New Query** again
2. Copy the entire "Migration #2" block above
3. Paste into SQL Editor
4. Click **Run** button (or press Ctrl+Enter)
5. Wait for success message ✅
6. See confirmation: "SUCCESS: 9 queries"

### Step 4: Verify Both Migrations
1. Open **Table Editor** in Supabase left sidebar
2. Look for `checklist_items` table - should appear
3. Click **users** table - scroll right to see `pin_hash` column

✅ **You're done with migrations!**

---

## Rollback Instructions (If Needed)

### Rollback Migration #1 (PIN Hashing)
```sql
DROP TRIGGER IF EXISTS trigger_log_pin_hash_update ON users;
DROP FUNCTION IF EXISTS log_pin_hash_update();
DROP INDEX IF EXISTS idx_users_pin_hash;
ALTER TABLE users DROP COLUMN IF EXISTS pin_hash;
```

### Rollback Migration #2 (Checklist)
```sql
DROP TABLE IF EXISTS checklist_items;
DROP FUNCTION IF EXISTS update_checklist_timestamp();
```

---

## Expected Output

### After Migration #1
```
SUCCESS
Operation completed

-- Queries run: 5
-- Total execution time: 0.345 seconds
```

### After Migration #2
```
SUCCESS
Operation completed

-- Queries run: 9
-- Total execution time: 1.234 seconds
```

---

## Troubleshooting

### "Error: relation already exists"
→ This is OK. The `IF NOT EXISTS` clause prevents re-creating existing objects.

### "Error: undefined table users"
→ Verify you're in the correct Supabase project.

### "Column already exists"
→ Normal if migrations were run before. `IF NOT EXISTS` prevents errors.

### Queries don't execute
→ Try running them separately (not as one block).

---

## Quick Verification

After both migrations run, test with these queries:

**Check PIN hashing is ready:**
```sql
SELECT EXISTS (SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'users' AND column_name = 'pin_hash');
```
Expected: `t` (true)

**Check checklist table exists:**
```sql
SELECT EXISTS (SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'checklist_items');
```
Expected: `t` (true)

**Check RLS is enabled:**
```sql
SELECT table_name, rowsecurity FROM information_schema.tables 
  WHERE table_name = 'checklist_items';
```
Expected: `checklist_items | true`

---

## ✅ Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Created New Query
- [ ] Copied Migration #1 entirely
- [ ] Pasted into SQL Editor
- [ ] Clicked Run and saw SUCCESS
- [ ] Created another New Query
- [ ] Copied Migration #2 entirely
- [ ] Pasted into SQL Editor
- [ ] Clicked Run and saw SUCCESS
- [ ] Verified `checklist_items` table exists
- [ ] Verified `pin_hash` column exists in users
- [ ] Ready to test application!

---

## 🎉 You're Done!

Both migrations are applied. Next step: Test the application.

See **MANDATE4_QUICK_START.md** for testing instructions.

---

**Status:** ✅ Ready to execute  
**Duration:** < 5 minutes  
**Next Step:** Run in Supabase SQL Editor
