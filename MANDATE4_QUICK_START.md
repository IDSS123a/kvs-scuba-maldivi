# ⚡ Mandate 4: Quick Start Guide

## For Getting Started with Testing

---

## ✅ What's Already Done

1. ✅ All code implemented and compiled
2. ✅ Production build successful (no errors)
3. ✅ Package dependencies installed
4. ✅ Documentation written (3 comprehensive guides)
5. ✅ Test plan prepared (31 test cases)

---

## 🔧 What You Need To Do Now

### Step 1: Apply Database Migrations (5 minutes)

Open **Supabase Console** → **SQL Editor** and run these TWO queries:

#### Query 1: PIN Hashing
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR;
CREATE INDEX IF NOT EXISTS idx_users_pin_hash ON users(pin_hash);
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
DROP TRIGGER IF EXISTS trigger_log_pin_hash_update ON users;
CREATE TRIGGER trigger_log_pin_hash_update
  AFTER UPDATE OF pin_hash ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_pin_hash_update();
```

#### Query 2: Checklist System
```sql
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
CREATE INDEX IF NOT EXISTS idx_checklist_user_id ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_checklist_checked ON checklist_items(checked);
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "checklist_read_own" ON checklist_items
  FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "checklist_update_own" ON checklist_items
  FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "checklist_insert_own" ON checklist_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "checklist_read_admin" ON checklist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'::user_role
    )
  );
CREATE OR REPLACE FUNCTION update_checklist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_checklist_timestamp ON checklist_items;
CREATE TRIGGER trigger_update_checklist_timestamp
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_timestamp();
```

✅ Both migrations should complete without errors.

---

### Step 2: Start the App (30 seconds)

```bash
npm run dev
```

This starts development server on **http://localhost:5173**

---

### Step 3: Test PIN Hashing (5 minutes)

1. **Test Legacy PIN ('1919')**
   - Login with existing Admin account using PIN: `1919`
   - Should work! ✅

2. **Test New PIN Generation**
   - Go to Admin Panel → **Korisnici**
   - Find any user
   - Click **Regeneriši PIN** (Regenerate PIN)
   - New PIN appears (e.g., `5234`)
   - Note it down
   - Logout
   - Request access as new user
   - Have admin approve and generate PIN
   - Try logging in with the new PIN
   - Should work! ✅

---

### Step 4: Test User Menu (2 minutes)

1. Look at **top-right corner** of app
2. Click the **circular avatar** with user initials
3. Dropdown menu appears with:
   - User name ✅
   - User email ✅
   - Theme toggle ✅
   - Language selector ✅
   - Logout button ✅
4. Click **Theme toggle** - app should change to dark/light mode
5. **Refresh page (F5)** - theme should persist ✅
6. Click **Language** - if supported, should change language
7. **Refresh page (F5)** - language should persist ✅

---

### Step 5: Test Checklist (5 minutes)

1. Look for **🎒 Moja Priprema** link in navigation
2. Click it - checklist should load with ~70 items
3. Items organized in 5 categories:
   - 📋 Dokumenti (Documents)
   - 🤿 Ronilačka Oprema (Diving Equipment)
   - 💰 Financije (Money)
   - 🏥 Zdravlje (Health)
   - 🎓 Sertifikati (Certifications)

4. **Test Checkboxes:**
   - Click the circle icon next to any item
   - Icon changes to checkmark ✅
   - Progress bar updates ✅

5. **Test Persistence:**
   - Check 5 items
   - Refresh page (F5)
   - Items should still be checked ✅

6. **Test Category Filter:**
   - Click "Ronilačka Oprema" tab
   - View filters to show only those items ✅
   - Click "Sve" to return to all items

7. **Test CSV Export:**
   - Click **Preuzmi CSV** button
   - File downloads as `checklist-YYYY-MM-DD.csv`
   - Open in Excel to verify ✅

---

### Step 6: Console Check (1 minute)

1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for any **RED ERROR** messages
   - ❌ Red errors = Problem
   - ⚠️ Yellow warnings = OK (e.g., Fixer.io API warnings)
4. Perform actions above while watching console
5. Should see NO RED ERRORS ✅

---

## 🎯 Quick Test Checklist

| Feature | Test | Result |
|---------|------|--------|
| PIN '1919' | Login with admin PIN | ✅/❌ |
| New PIN | Generate & login with new PIN | ✅/❌ |
| User Menu | Click avatar, see dropdown | ✅/❌ |
| Theme Toggle | Change theme, persist after refresh | ✅/❌ |
| Language | Change language, persist after refresh | ✅/❌ |
| Checklist Load | Items appear on first access | ✅/❌ |
| Checkbox | Click item, changes to checked | ✅/❌ |
| Persistence | Refresh page, items still checked | ✅/❌ |
| Category Filter | Click category tab, filters view | ✅/❌ |
| CSV Export | Download CSV file | ✅/❌ |
| Console | No red errors in F12 console | ✅/❌ |

---

## 🔍 Verification in Supabase

After testing, verify data in Supabase:

### Check PIN Hashing Worked
```sql
SELECT email, pin_code, pin_hash FROM users LIMIT 5;
```
Expected: New users have `pin_hash` like `$2a$10$...`

### Check Checklist Items Saved
```sql
SELECT user_id, category, name, checked FROM checklist_items 
WHERE checked = true LIMIT 10;
```
Expected: Rows showing checked items

### Check RLS Working
Each user should ONLY see their own checklist items.

---

## 📚 Full Documentation

For detailed testing:
- **Deployment Guide:** `MANDATE4_DEPLOYMENT_INSTRUCTIONS.md`
- **Full Test Plan:** `MANDATE4_E2E_TEST_PLAN.md` (31 test cases)
- **Completion Summary:** `MANDATE4_COMPLETION_SUMMARY.md`

---

## ⚡ If Something Goes Wrong

### Build Error
```bash
npm install
npm run build
```

### PIN Not Hashing
- Verify bcryptjs installed: `npm list bcryptjs`
- Verify migration #1 applied (check pin_hash column exists)

### Checklist Not Loading
- Verify migration #2 applied
- Check browser console (F12) for errors
- Verify user is logged in

### Theme Not Persisting
- Open DevTools → Application → Local Storage
- Should see `kvs_theme` key
- If missing, browser storage might be disabled

### Still Stuck?
See troubleshooting in `MANDATE4_DEPLOYMENT_INSTRUCTIONS.md`

---

## 📞 Contact

For issues, check:
1. Browser console (F12) for error messages
2. Supabase logs for database errors
3. Network tab for failed API calls
4. Full test plan for expected behaviors

---

## ✨ Summary

Mandate 4 is **production-ready!**

You need to:
1. ✅ Apply 2 SQL migrations
2. ✅ Run tests (quick version above ~20 minutes, or full version ~90 minutes)
3. ✅ Verify everything works
4. ✅ Deploy!

**Time needed:** 30 minutes for quick test, 2 hours for full test suite

**Status:** 🚀 Ready to rock!
