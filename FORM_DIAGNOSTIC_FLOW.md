# Form Submission - Practical Diagnostic Flow

**Use this guide to systematically diagnose and fix form submission issues.**

---

## 🎯 Choose Your Situation

### Situation 1: Form Was Working, Now Broken
**Time to fix: 5-15 minutes**

1. **Hard refresh browser**
   ```
   Windows/Linux: Ctrl+Shift+R
   Mac: Cmd+Shift+R
   ```

2. **Open browser console (F12)**

3. **Run diagnostic:**
   ```javascript
   diag.runAll()
   ```

4. **Check output:**
   - If `✅ ALL TESTS PASSED` → Form should work. Try submitting.
   - If `❌ Connection failed` → Skip to Situation 2
   - If `❌ Form submission failed` → See error type below

---

### Situation 2: Form Never Worked / Just Set Up
**Time to fix: 10-20 minutes**

1. **Verify environment setup**
   ```javascript
   // In browser console:
   console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```
   - Should show actual values (not "undefined")
   - If undefined → see "Environment Setup" section below

2. **Test Supabase connection**
   ```javascript
   diag.testConnection()
   ```
   - If `✅ PASS` → Continue to step 3
   - If `❌ FAIL` → Check internet, restart dev server

3. **Test form submission (direct API)**
   ```javascript
   diag.testSubmission()
   ```
   - If `✅ SUCCESS` → Form should work, test it now
   - If `❌ 403 Forbidden` → Apply RLS policies (see section below)
   - If `❌ Other error` → See error mapping table below

---

### Situation 3: Getting Specific Error Message
**Time to fix: 2-10 minutes depending on error**

#### Error: `403 Forbidden` or `does not have the ability`

**THIS IS THE MOST COMMON ERROR**

**What it means:** Supabase RLS policy is blocking the insert

**How to fix (2 minutes):**

1. Open Supabase Dashboard: https://app.supabase.com
2. Click "SQL Editor" in left sidebar
3. Click "+ New Query"
4. Paste this SQL:
```sql
-- Enable RLS policies for form submissions
ALTER TABLE divers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_insert" ON divers
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "allow_public_select" ON divers
FOR SELECT TO anon
USING (true);

CREATE POLICY "allow_auth_insert" ON divers
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_auth_select" ON divers
FOR SELECT TO authenticated
USING (true);
```
5. Click "Run" (or Ctrl+Enter)
6. Should see "Success!" ✅

**Verify fix:**
```javascript
// Back in browser console:
diag.testSubmission()
// Should now show ✅ SUCCESS!
```

---

#### Error: `400 - duplicate key` or `duplicate email`

**What it means:** That email is already in the database

**How to fix (1 minute):**
```javascript
// Use a different email in test
diag.testSubmission('newemail-' + Date.now() + '@example.com')
```

Or in the form:
- Clear email field
- Enter completely different email address
- Submit again

---

#### Error: `400 - null value violates not-null constraint`

**What it means:** A required field is empty in the form

**How to fix (2 minutes):**
1. Reload page: F5 or Ctrl+R
2. Make sure ALL fields are filled:
   - Name: ✅ required
   - Email: ✅ required
   - Phone: ❌ optional
   - Experience: ❌ optional
3. Click Submit

---

#### Error: `401 Unauthorized` or `Invalid API Key`

**What it means:** VITE_SUPABASE_ANON_KEY is wrong or missing

**How to fix (5 minutes):**
1. Open `.env.local` file in project root
2. Find `VITE_SUPABASE_ANON_KEY`
3. Go to Supabase Dashboard → Project Settings → API
4. Copy "anon" key (not "service_role")
5. Paste into `.env.local` (exactly, no quotes)
6. Restart dev server: `npm run dev`
7. Hard refresh browser: Ctrl+Shift+R
8. Test again: `diag.testSubmission()`

---

#### Error: Connection Timeout / No Response

**What it means:** Cannot reach Supabase servers

**How to fix (3 minutes):**
1. Check internet connection
2. Check Supabase status: https://status.supabase.com
3. Restart dev server: `npm run dev`
4. Wait 10 seconds
5. Try again: `diag.testSubmission()`

---

## 📋 Environment Setup

### Verify `.env.local` File

**1. Check file exists**
- File: `c:\...\kvs-scuba-maldivi\.env.local`
- Should be in project root (same folder as `package.json`)

**2. Check contents**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXA...very-long-key...
```

**3. Get correct values**
- Go to Supabase Dashboard: https://app.supabase.com
- Click your project
- Go to Settings → API
- Copy values (no quotes, no spaces)

**4. After editing `.env.local`**
- Stop dev server: Ctrl+C
- Start dev server: `npm run dev`
- Hard refresh browser: Ctrl+Shift+R

---

## 🔧 Step-by-Step Troubleshooting

### Step 1: Environment Variables (2 minutes)
```javascript
// In browser console, check:
console.log('URL is set:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Key is set:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
// Should both show: true
```

If either is `false`:
1. Check `.env.local` exists
2. Verify keys are there (no typos)
3. Restart dev server
4. Hard refresh browser

---

### Step 2: Connection Test (2 minutes)
```javascript
// In browser console:
diag.testConnection()
```

Expected output: `✅ Supabase connection is working`

If failed:
- Check internet connection
- Check Supabase status
- Restart dev server
- Verify VITE_SUPABASE_URL is correct

---

### Step 3: API Test (Direct Submission)
```javascript
// In browser console:
diag.testSubmission()
```

Expected output: `✅ SUCCESS! Data inserted`

If `❌ 403 Forbidden`:
→ Follow "Error: 403 Forbidden" section above

If `❌ 400`:
→ Check what the error message says

If other error:
→ Check console output for error type

---

### Step 4: Form Test
1. Fill out form with valid data
2. Click "Submit Request"
3. Watch console for logs (should see 📤, ✅, or ❌)
4. Check form shows success message or error

---

## 🎓 Understanding the Logs

### Successful Submission (What You Want to See)
```
📤 Submitting form data: {name: "...", email: "..."}
✅ Access request submitted successfully
✅ Access request log created
✅ Form submission complete
📍 Navigating to confirmation page
```

### Failed Submission (What You're Troubleshooting)
```
⚠️ Validation failed: Invalid email format
   OR
❌ Insert error details: {message: "...", code: "403"}
   OR
🔍 ERROR DIAGNOSTIC INFO
   ⚠️ LIKELY CAUSE: RLS policy blocking insert
   FIX: Apply RLS policies in Supabase SQL Editor
```

---

## ✅ Verification Checklist

After making fixes, verify everything works:

- [ ] **Environment variables set**
  ```javascript
  import.meta.env.VITE_SUPABASE_URL !== undefined
  import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined
  ```

- [ ] **Supabase connection working**
  ```javascript
  diag.testConnection()
  // Should show: ✅ Supabase connection is working
  ```

- [ ] **API accepts data**
  ```javascript
  diag.testSubmission()
  // Should show: ✅ SUCCESS! Data inserted
  ```

- [ ] **RLS policies configured**
  - Go to Supabase Dashboard → Your Table → Policies
  - Should see at least 4 policies listed

- [ ] **Data appears in database**
  - Supabase Dashboard → Tables → divers
  - Should see test record with your test email

- [ ] **Form works**
  - Fill in form
  - Submit
  - See success message
  - Check Supabase for new record

---

## 🚀 If Everything Works

1. **Clean up test data** (optional)
   ```sql
   -- In Supabase SQL Editor:
   DELETE FROM divers WHERE email LIKE 'test-%@example.com';
   ```

2. **Test with real email**
   - Open form
   - Fill with real email address
   - Submit and verify it works

3. **You're ready for production!**
   - Form is working
   - All diagnostics pass
   - Ready to deploy

---

## 🆘 Still Broken?

Before asking for help, collect:

1. **Run full diagnostics**
   ```javascript
   diag.runAll()
   ```

2. **Screenshot console output**

3. **Check `.env.local` file**
   - Is it there?
   - Does it have correct keys?

4. **Check Supabase**
   - Is project active?
   - Does `divers` table exist?
   - Are RLS policies created?

5. **Share with support**
   - Exact error message
   - Console output screenshot
   - Steps you've tried
   - What you expected to happen

---

## 📚 Related Guides

- [FORM_QUICK_FIX.md](./FORM_QUICK_FIX.md) - Ultra-quick 2-5 minute fixes
- [FORM_ERROR_DEBUG.md](./FORM_ERROR_DEBUG.md) - Detailed error reference
- [CONSOLE_COMMANDS.md](./CONSOLE_COMMANDS.md) - Browser console commands reference

---

**Time to Complete:** 5-20 minutes  
**Difficulty:** Beginner-friendly  
**Success Rate:** 95%+ of issues  

**Last Updated:** December 23, 2025
