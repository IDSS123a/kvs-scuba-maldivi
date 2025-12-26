# START HERE - IMMEDIATE ACTIONS ⚡

**Complete these steps in order. Do not skip steps.**

---

## ☐ STEP 1: BACKUP YOUR DATABASE (5 minutes)

**Why:** Protect your data before making schema changes.

### Actions:
- [ ] Open Supabase Dashboard (https://app.supabase.com)
- [ ] Select your project: `kvs-scuba-maldivi`
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Click **New Query**
- [ ] Paste this command to verify current tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public' 
ORDER BY table_name;
```

- [ ] Click **RUN** button
- [ ] **Take a screenshot** of the results
- [ ] Go to **Project Settings** → **Backups**
- [ ] Click **Take Manual Backup**
- [ ] Wait for backup to complete (check status)

### ✅ Expected Outcome:
- You see existing tables listed (if any)
- Backup is created and shows in backup history
- Screenshot saved for reference

---

## ☐ STEP 2: EXECUTE PHASE 1 PART A - DATABASE SCHEMA (10 minutes)

**What:** Creates the core database tables.

### Actions:

**2.1 - Find and prepare the SQL file:**
- [ ] Open file: `PHASE1_DATABASE_SCHEMA.sql`
- [ ] Select ALL content (Ctrl+A)
- [ ] Copy (Ctrl+C)

**2.2 - Execute in Supabase:**
- [ ] Go to Supabase SQL Editor
- [ ] Click **New Query**
- [ ] Paste the SQL content (Ctrl+V)
- [ ] Click **RUN** button
- [ ] **Wait for completion message**

**2.3 - Verify execution:**
- [ ] You should see message: `Success - X queries executed`
- [ ] Click **New Query** again
- [ ] Paste this verification query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public' 
ORDER BY table_name;
```

- [ ] Click **RUN**
- [ ] **Take a screenshot** showing all new tables

### ✅ Expected Outcome:
- All 5 tables created: `users`, `expeditions`, `team_members`, `dive_logs`, `checklists`
- No error messages
- Verification query shows all tables
- Screenshot saved

### ⚠️ If there's an error:
1. Check the error message
2. Do NOT continue to Step 3
3. Contact support with screenshot of error
4. Restore from backup (Step 1)

---

## ☐ STEP 3: EXECUTE PHASE 1 PART B - ROW LEVEL SECURITY (5 minutes)

**What:** Adds security policies to tables.

### Actions:

**3.1 - Find and prepare the SQL file:**
- [ ] Open file: `PHASE1_RLS_POLICIES.sql`
- [ ] Select ALL content (Ctrl+A)
- [ ] Copy (Ctrl+C)

**3.2 - Execute in Supabase:**
- [ ] Go to Supabase SQL Editor
- [ ] Click **New Query**
- [ ] Paste the SQL content (Ctrl+V)
- [ ] Click **RUN** button
- [ ] **Wait for completion message**

**3.3 - Verify execution:**
- [ ] You should see: `Success - X queries executed`
- [ ] No error messages
- [ ] Click **New Query** again
- [ ] Paste this verification query:

```sql
SELECT 
    schemaname,
    tablename,
    (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

- [ ] Click **RUN**
- [ ] **Take a screenshot** showing policies created
- [ ] **Note:** Each table should show policy_count > 0

### ✅ Expected Outcome:
- RLS policies created successfully
- All public tables have security policies
- No error messages
- Screenshot saved

---

## ☐ STEP 4: VERIFY DATABASE INTEGRITY (5 minutes)

**What:** Confirm everything is set up correctly.

### Actions:

**4.1 - Check table structure:**
- [ ] Go to Supabase SQL Editor
- [ ] Click **New Query**
- [ ] Paste this query:

```sql
-- Check all tables exist
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema='public'
GROUP BY table_name
ORDER BY table_name;
```

- [ ] Click **RUN**
- [ ] **Verify:** You see 5 tables with columns

**4.2 - Check RLS is enabled:**
- [ ] Click **New Query**
- [ ] Paste this query:

```sql
-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname='public'
ORDER BY tablename;
```

- [ ] Click **RUN**
- [ ] **Verify:** All tables show `rowsecurity = true`

**4.3 - Check policy count:**
- [ ] Click **New Query**
- [ ] Paste this query:

```sql
-- Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname='public'
GROUP BY tablename
ORDER BY tablename;
```

- [ ] Click **RUN**
- [ ] **Take screenshot** of all three results
- [ ] **Verify:** Each table has policies

### ✅ Expected Outcome:
- All 5 tables exist
- All 5 tables have RLS enabled (true)
- All 5 tables have security policies
- No errors
- All screenshots saved

### 📋 Checklist Summary:
- [ ] 5 tables created
- [ ] All RLS enabled
- [ ] Policies configured
- [ ] All screenshots taken
- [ ] No errors encountered

---

## ☐ STEP 5: ENVIRONMENT SETUP (10 minutes)

**What:** Configure your local application to connect to the database.

### Actions:

**5.1 - Open environment file:**
- [ ] In VS Code, press Ctrl+P (Quick Open)
- [ ] Type: `.env.local`
- [ ] Press Enter to open the file
- [ ] If file doesn't exist, go to Step 5.2

**5.2 - Create .env.local if missing:**
- [ ] In VS Code, open the root folder
- [ ] Right-click in Explorer → **New File**
- [ ] Name it: `.env.local`
- [ ] Press Enter

**5.3 - Add Supabase credentials:**
- [ ] Get your credentials from Supabase:
  - Go to Supabase Dashboard
  - Click **Settings** → **API**
  - Copy: `Project URL` and `Anon Public Key`

- [ ] In `.env.local`, add or update:

```
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] Replace `your_project_url_here` with actual URL
- [ ] Replace `your_anon_key_here` with actual key
- [ ] **Do NOT include quotes around values**

**5.4 - Add Google OAuth (if using):**
- [ ] In `.env.local`, add:

```
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

- [ ] Replace with your actual Google OAuth Client ID
- [ ] If you don't have Google OAuth set up, skip this step

**5.5 - Save file:**
- [ ] Press Ctrl+S to save
- [ ] Verify no error messages

### ✅ Expected Outcome:
- `.env.local` file exists in root directory
- Contains valid Supabase credentials
- Application can connect to database
- File saved without errors

### 🔍 Verification:
- [ ] File exists: `.env.local`
- [ ] Contains REACT_APP_SUPABASE_URL
- [ ] Contains REACT_APP_SUPABASE_ANON_KEY
- [ ] Values are not empty
- [ ] File is saved

---

## ☐ STEP 6: INSTALL DEPENDENCIES (3 minutes)

**What:** Get all required libraries.

### Actions:

**6.1 - Install npm packages:**
- [ ] Open Terminal in VS Code (Ctrl+`)
- [ ] Type this command:

```bash
npm install
```

- [ ] Press Enter
- [ ] Wait for completion (may take 1-2 minutes)
- [ ] **Look for:** `added X packages` message

**6.2 - Verify installation:**
- [ ] Check for error messages (in red)
- [ ] If you see `npm ERR!`, take screenshot and contact support
- [ ] If successful, continue to Step 7

### ✅ Expected Outcome:
- All packages installed
- No error messages
- `node_modules` folder created (may be hidden)
- Terminal shows: `added X packages in Y seconds`

---

## ☐ STEP 7: START DEVELOPMENT SERVER (5 minutes)

**What:** Run the application locally.

### Actions:

**7.1 - Start the server:**
- [ ] In Terminal, type:

```bash
npm run dev
```

- [ ] Press Enter
- [ ] **Wait for message:** `Local: http://localhost:5173` or similar

**7.2 - Open application:**
- [ ] Once server is running, open browser
- [ ] Go to: `http://localhost:5173`
- [ ] You should see the KVS Scuba application homepage
- [ ] **Take a screenshot**

**7.3 - Keep terminal open:**
- [ ] Do NOT close the terminal
- [ ] Do NOT stop the server (Ctrl+C)
- [ ] The server must stay running while you develop

### ✅ Expected Outcome:
- Development server running
- Application visible in browser
- No major error messages in terminal
- Screenshot saved
- Ready to test features

### ⚠️ Troubleshooting:
| Issue | Solution |
|-------|----------|
| Port already in use | Close other apps or restart computer |
| Module not found | Run `npm install` again |
| Blank page | Check browser console (F12), look for errors |
| Connection error to database | Verify `.env.local` credentials |

---

## ☐ FINAL VERIFICATION CHECKLIST

**Before declaring success, verify all of these:**

- [ ] **Database Backup:** Taken and saved
- [ ] **Phase 1A Complete:** All 5 tables created
- [ ] **Phase 1B Complete:** RLS policies applied
- [ ] **Database Verified:** All integrity checks passed
- [ ] **Environment File:** `.env.local` created with credentials
- [ ] **Dependencies Installed:** `npm install` completed
- [ ] **Server Running:** Development server active at `http://localhost:5173`
- [ ] **Application Loads:** No major errors in browser console
- [ ] **Screenshots:** All verification screenshots saved
- [ ] **Ready for Next Phase:** All steps completed successfully

---

## ✅ SUCCESS!

**You are now ready for Phase 2!**

### Next Steps:

1. **Keep the development server running** (don't close the terminal)
2. **Read:** `SYSTEM_REDESIGN_GET_STARTED.md` → **Phase 2** section
3. **Follow:** Phase 2 integration steps
4. **Test:** New features as they're added

### Support:

If you encounter any errors:
1. **Screenshot the error message**
2. **Note the step number**
3. **Check troubleshooting section** for that step
4. **Contact support with:**
   - Screenshots of error
   - Step where it occurred
   - Your database backup file

---

## ⏱️ TOTAL TIME REQUIRED: ~45 minutes

| Step | Time | Status |
|------|------|--------|
| Step 1: Backup | 5 min | ☐ |
| Step 2: Phase 1A | 10 min | ☐ |
| Step 3: Phase 1B | 5 min | ☐ |
| Step 4: Verify | 5 min | ☐ |
| Step 5: Environment | 10 min | ☐ |
| Step 6: Dependencies | 3 min | ☐ |
| Step 7: Server | 5 min | ☐ |
| **TOTAL** | **43 min** | ☐ |

---

**Start with STEP 1 now. Do not skip any steps.**

Last Updated: December 24, 2025
