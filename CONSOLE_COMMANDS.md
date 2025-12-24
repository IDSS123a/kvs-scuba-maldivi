# Browser Console Commands for Form Diagnostics

## Quick Access
Open browser console and use these commands to test form submission:

### Command: `diag.testConnection()`
**Tests if Supabase is reachable**
```javascript
diag.testConnection()
```
- Checks environment variables are set
- Tests network connectivity to Supabase
- Shows URL being used

**Output to expect:**
```
✅ Supabase connection is working
   Status: 200
```

**If it fails:**
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

### Command: `diag.testSubmission()`
**Tests form submission without form validation**
```javascript
diag.testSubmission()
```
- Creates test data with unique email (uses timestamp)
- Sends directly to Supabase API
- Identifies the exact error without form interference

**Output to expect (SUCCESS):**
```
✅ SUCCESS! Data inserted
   Status: 201
   Inserted ID: abc-123-def
   Email: test-1234567890@example.com
```

**Output to expect (FAILURE):**
```
❌ FAILED! Status: 403
   ERROR TYPE: 403 Forbidden (RLS Policy)
   SUGGESTED FIX: Apply RLS policies...
```

**If it fails:**
- Look at ERROR TYPE in console
- Follow SUGGESTED FIX
- See mapping table below

---

### Command: `diag.testSubmission('your-email@example.com')`
**Test with your own email**
```javascript
diag.testSubmission('yourtest@example.com')
```
Useful if you want to track exactly which email you tested with.

---

### Command: `diag.runAll()`
**Run all tests in sequence**
```javascript
diag.runAll()
```
- Runs connection test first
- If successful, runs submission test
- Provides full diagnostic report

---

## Error Messages & Solutions

| Error Type | Status | Most Likely Cause | Solution |
|---|---|---|---|
| 403 Forbidden (RLS Policy) | 403 | RLS policies not configured | See "QUICK FIX" section below |
| 400 Duplicate Email | 400 | Email already in database | Use different email: `diag.testSubmission('new-email@example.com')` |
| 400 Bad Request | 400 | Validation error | Check form fields match database schema |
| 401 Unauthorized | 401 | Wrong API key | Verify `VITE_SUPABASE_ANON_KEY` in `.env.local` |
| Connection Timeout | Network | No internet or firewall | Check internet, try https://status.supabase.com |

---

## QUICK FIX: Apply RLS Policies

If you see `403 Forbidden (RLS Policy)` error:

**1. Open Supabase Dashboard**
   - https://app.supabase.com
   - Select your project

**2. Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

**3. Copy and paste this SQL:**
```sql
-- Enable RLS on divers table
ALTER TABLE divers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public (anon) to insert
CREATE POLICY "allow_public_insert" ON divers
FOR INSERT TO anon
WITH CHECK (true);

-- Policy 2: Allow public (anon) to read
CREATE POLICY "allow_public_select" ON divers
FOR SELECT TO anon
USING (true);

-- Policy 3: Allow authenticated users to insert
CREATE POLICY "allow_auth_insert" ON divers
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policy 4: Allow authenticated users to read
CREATE POLICY "allow_auth_select" ON divers
FOR SELECT TO authenticated
USING (true);
```

**4. Run Query**
   - Click "Run" button (Ctrl+Enter)
   - Should see "Success!" message

**5. Test Again**
   - Go back to browser
   - Run: `diag.testSubmission()`
   - Should now see `✅ SUCCESS!`

---

## Verification Checklist

After applying RLS policies:

- [ ] Run `diag.testSubmission()` in console
- [ ] See `✅ SUCCESS!` message
- [ ] Check Supabase Dashboard → divers table
- [ ] See test data appeared in table
- [ ] Form still works (test it)
- [ ] No more 403 errors

---

## Advanced Debugging

### View Full Error Object
```javascript
// Run submission test and capture error
const result = await diag.testSubmission();
console.log(result);
// Shows full error details
```

### Test with Custom Data
```javascript
// Direct API call with custom data (for advanced users)
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

fetch(`${url}/rest/v1/divers`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'apikey': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Your Name',
    email: 'your@email.com'
  })
})
.then(r => r.json())
.then(data => console.log('Result:', data))
.catch(err => console.error('Error:', err));
```

### Check Environment Variables
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
// Should show your actual values, not "undefined"
```

---

## Common Issues & Fixes

### Issue: Commands show as undefined
**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Restart dev server: `npm run dev`
3. Try commands again

### Issue: Still getting 403 error after applying RLS
**Fix:**
1. Verify SQL executed successfully (should see "Success!")
2. Check policies were created: Open SQL Editor → Look for "Policies" section
3. Try different email in test: `diag.testSubmission('test-new@example.com')`

### Issue: Commands work but form still fails
**Fix:**
1. Check browser console for form-specific errors (red text)
2. Check Network tab for failed requests (F12 → Network → look for red 403/400)
3. Hard refresh and try form again
4. Check error message in form (should be more helpful now)

---

## Before Getting Help

Please gather this information:

1. **What error do you see?**
   - Run: `diag.testSubmission()`
   - Copy the ERROR TYPE and SUGGESTED FIX

2. **When did it start?**
   - Did form work before?
   - What changed?

3. **Full error details:**
   - Run: `diag.runAll()`
   - Take screenshot of console output
   - Copy full error message

4. **Confirmation of steps taken:**
   - [ ] Applied RLS policies from SQL above?
   - [ ] Hard refreshed browser?
   - [ ] Restarted dev server?
   - [ ] Checked `.env.local` file?

---

## Access Commands Anywhere

These commands are available:
- In browser console (F12)
- On any page
- Any time (no need to be on login page)
- Even if form not visible

Simply type in console:
```javascript
diag.testConnection()
diag.testSubmission()
diag.runAll()
```

---

## Resources

- **Main debugging guide:** [FORM_ERROR_DEBUG.md](./FORM_ERROR_DEBUG.md)
- **Quick fixes:** [FORM_QUICK_FIX.md](./FORM_QUICK_FIX.md)
- **Supabase docs:** https://supabase.com/docs
- **Supabase status:** https://status.supabase.com

---

**Last Updated:** December 23, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
