# Quick Troubleshooting Checklist

## Before Testing

- [ ] Supabase project is set up and database exists
- [ ] `divers` table exists with columns: id, name, email, phone, status, access_status, created_at
- [ ] Supabase API key (anon key) is correct in `supabaseClient.ts`
- [ ] RLS policies allow anonymous inserts to `divers` table (if using row-level security)

## Testing Form Submission

### Step 1: Open Developer Tools
- [ ] Press F12 or right-click → "Inspect"
- [ ] Go to "Console" tab
- [ ] Go to "Network" tab

### Step 2: Submit Form
- [ ] Click "Request Access" button
- [ ] Enter Name: "Test User"
- [ ] Enter Email: "test@example.com"
- [ ] Leave Phone and Experience blank
- [ ] Click "Submit Request"

### Step 3: Check Console
Look for this message (indicates success):
```
✅ Access request submitted: [...]
```

If you see an error instead:
```
ERROR: Insert error: {message}
```
Note the error message and check the solutions below.

### Step 4: Check Network
- [ ] Look for request to `supabase.co` domain
- [ ] Check Status code: should be 200 or 201
- [ ] If Status is 403 → RLS policy issue
- [ ] If Status is 500 → Database/server error

### Step 5: Verify in Supabase
1. Go to Supabase Dashboard
2. Select your project
3. Go to "Table Editor" → "divers"
4. Look for new row with test@example.com
5. Check fields:
   - [ ] name = "Test User"
   - [ ] email = "test@example.com"
   - [ ] phone = NULL (empty field)
   - [ ] status = "pending"
   - [ ] access_status = "pending"
   - [ ] created_at = recent timestamp

## Common Issues & Fixes

### ❌ "All fields are required" error
**Check:**
- Is email field empty?
- Is email in valid format (user@domain.com)?

**Fix:**
- Fill both Name and Email
- Ensure email has @ symbol and domain

---

### ❌ "Error: Unauthorized" (401)
**Check:**
- Is Supabase API key correct?
- Is API key from "Settings → API" in Supabase?

**Fix:**
1. Go to Supabase Dashboard
2. Project → Settings → API
3. Copy "anon public" key
4. Update `SUPABASE_ANON_KEY` in `.env` or `supabaseClient.ts`

---

### ❌ "Forbidden" error (403)
**Check:**
- Is RLS policy enabled on `divers` table?
- Does anonymous role have INSERT permission?

**Fix:**
1. Go to Supabase Dashboard
2. Project → Authentication → Policies
3. Find `divers` table
4. Check if there's an INSERT policy for `anon` role
5. If not, create one:
   - Go to `divers` table → "Auth" tab
   - Click "Enable RLS" if not enabled
   - Add policy: Name: "Allow anon insert"
   - Target roles: anon
   - Operation: INSERT
   - Check: true

---

### ❌ "Database error" (500)
**Check:**
- Do all columns exist in `divers` table?
- Are column types correct?
- Is table accessible?

**Fix:**
1. Go to Supabase Dashboard
2. Project → Table Editor → divers
3. Verify these columns exist:
   - id (UUID)
   - name (text)
   - email (text)
   - phone (text, nullable)
   - status (text)
   - access_status (text)
   - created_at (timestamp)
4. If any missing, add by clicking "+ Add Column"

---

### ❌ Form hangs (loading spinner won't stop)
**Check:**
- Is browser console showing any errors?
- Is internet connection working?
- Is Supabase API responsive?

**Fix:**
1. Refresh page (Ctrl+R or Cmd+R)
2. Try again
3. Check if Supabase status page shows issues
4. If still hanging, check network tab for failed requests

---

### ❌ Success message appears but no data in database
**Check:**
- Did you check the correct table?
- Are you logged into the right Supabase project?
- Is the email address visible in the table?

**Fix:**
1. Refresh Supabase table view (F5)
2. Check if there's a search/filter applied
3. Scroll right to see all columns
4. Verify you're in correct project (check URL)

---

## Advanced Debugging

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Project → Logs → API Logs
3. Search for your email address
4. Look for 400, 403, or 500 errors
5. Error details should show the problem

### Test with cURL (Command Line)
```bash
# Replace these values:
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
ANON_KEY="YOUR-ANON-KEY"
EMAIL="test@example.com"

curl -X POST \
  "$SUPABASE_URL/rest/v1/divers" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "'$EMAIL'",
    "phone": null,
    "status": "pending",
    "access_status": "pending",
    "created_at": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
  }'
```

If this works, issue is with form. If fails, issue is with Supabase setup.

---

## Form Fields Summary

### Required
- **Full Name**: Any text, min 1 character
- **Email**: Must be valid format (user@domain.com)

### Optional
- **Phone**: Any text (stored as NULL if empty)
- **Experience**: Any text up to textarea limit

### Auto-filled
- **status**: "pending"
- **access_status**: "pending"
- **created_at**: Current timestamp (server time)

---

## Success Indicators

✅ You know form is working when:
1. Console shows `✅ Access request submitted`
2. Success message appears on screen
3. Data shows in Supabase `divers` table within seconds
4. "Back to Login" button appears

---

## Getting Help

If stuck:
1. **Check console errors** (F12 → Console)
2. **Check network requests** (F12 → Network)
3. **Read error message carefully** - it usually explains the problem
4. **Check Supabase logs** - may have more details
5. **Verify RLS policies** - most common issue for 403 errors
6. **Verify database schema** - missing columns cause 500 errors

## Contact Information
If issue persists:
- Check Supabase documentation: https://supabase.com/docs
- Review form code: `components/AccessRequestForm.tsx`
- Check debugging guide: `FORM_DEBUGGING_GUIDE.md`
