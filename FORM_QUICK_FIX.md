# ⚡ Form Submission - Quick Diagnostic Checklist

**Use this to quickly identify and fix form submission issues.**

---

## 🎯 Quick Check (2 Minutes)

### ✅ Is the form appearing?
- [ ] YES → Continue to "Testing Submission"
- [ ] NO → Check Browser Console for errors (F12 → Console)

### ✅ Does form accept input?
- [ ] YES → Continue to "Testing Submission"
- [ ] NO → Check if JavaScript is enabled, reload page

### ✅ Can you see the Submit button?
- [ ] YES → Continue to "Testing Submission"
- [ ] NO → Scroll down or check screen size

---

## 🧪 Testing Submission (5 Minutes)

### Step 1: Fill Out Form
```
Name: Test User
Email: test@example.com
Phone: (leave blank)
Experience: (leave blank)
```

### Step 2: Open Browser Console
- Press **F12** on Windows/Linux
- Press **Cmd+Option+I** on Mac
- Click **Console** tab

### Step 3: Submit Form
- Click "Submit Request" button
- Watch the console for messages

### Step 4: Identify What You See

| What You See | Status | Next Step |
|---|---|---|
| ✅ Success message | ✅ WORKING | Check Supabase to verify data saved |
| ❌ Red error in console | ❌ BROKEN | See "Error Solutions" below |
| 📤 "Submitting..." spinner | ⏳ LOADING | Wait 5 seconds, then check console |
| Network error | ❌ BROKEN | Check internet connection |
| Nothing happens | ❌ BROKEN | Hard refresh (Ctrl+Shift+R) and retry |

---

## 🔴 Error Solutions

### If You See: `403 Forbidden` or `does not have the ability to insert`

**This is the most common error!**

**Solution:** Configure RLS policies in Supabase

```sql
-- Run these in Supabase SQL Editor:

CREATE POLICY "allow_anonymous_insert" ON divers
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "allow_anonymous_select" ON divers
FOR SELECT TO anon
USING (true);
```

**Time to fix:** 2 minutes  
**After fixing:** Reload page and test again

---

### If You See: `duplicate key value violates unique constraint`

**This means:** Email is already in database

**Solution:** Use a different email address
- Try: `test2@example.com`
- Or: `test-$(date).example.com`

---

### If You See: `null value in column violates not-null constraint`

**This means:** A required field is empty

**Solution:** 
1. Reload the page (Ctrl+Shift+R)
2. Fill in ALL fields
3. Submit again

---

### If You See: Network Error or CORS Error

**This means:** Cannot reach Supabase

**Solution:**
1. Check internet connection
2. Check if Supabase is online: https://status.supabase.com
3. Verify SUPABASE_URL in `.env.local`
4. Hard refresh page (Ctrl+Shift+R)

---

### If You See: No Error, but Nothing Happens

**This means:** Form may be stuck

**Solution:**
1. Hard refresh page: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Try again
3. If still stuck, restart dev server: `npm run dev`

---

## ✨ What to Look For in Console

### ✅ Successful Submission
```
📤 Submitting form data: {name: "...", email: "..."}
✅ Access request submitted successfully: {...}
✅ Access request log created
✅ Form submission complete. Clearing fields and navigating...
```

### ❌ Failed Submission
```
⚠️ Validation failed: Missing required fields
   OR
⚠️ Validation failed: Invalid email format
   OR
❌ Insert error details: {message: "...", code: "..."}
```

---

## 🔧 Configuration Checklist

Before testing, verify these are set up:

- [ ] `.env.local` file exists in project root
- [ ] Contains `VITE_SUPABASE_URL`
- [ ] Contains `VITE_SUPABASE_ANON_KEY`
- [ ] No quotes around values (wrong: `"value"`, right: `value`)
- [ ] No trailing spaces
- [ ] Dev server is running: `npm run dev`
- [ ] Supabase project is active

### How to Check Environment Variables

In browser console, run:
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Should show your Supabase details (not undefined).

---

## 📊 Verification Checklist

After form submits successfully:

- [ ] Console shows "✅ Access request submitted successfully"
- [ ] Success message appears on screen ("Your Request Was Sent!")
- [ ] Data appears in Supabase Dashboard → divers table
- [ ] Email address is in the table
- [ ] Name is correct
- [ ] Status shows "pending"

If all checked → ✅ **FORM IS WORKING!**

---

## 🆘 Still Broken?

### Try These Steps In Order:

1. **Restart dev server**
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

2. **Hard refresh browser**
   ```
   Windows/Linux: Ctrl+Shift+R
   Mac: Cmd+Shift+R
   ```

3. **Check RLS policies in Supabase**
   - Go to Supabase Dashboard → divers table
   - Look for "RLS Policies" section
   - Should see 4 policies
   - If not, run the SQL (provided above)

4. **Check .env.local file**
   - Should have exact credentials
   - No typos
   - No extra spaces

5. **Test direct API call**
   ```javascript
   // In browser console:
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
       name: 'Test',
       email: `test${Date.now()}@test.com`
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

---

## 📋 Error Reference Table

| Error | Cause | Fix | Time |
|-------|-------|-----|------|
| 403 Forbidden | RLS not set | Run SQL in Supabase | 2 min |
| duplicate key | Email exists | Use different email | 1 min |
| null violates not-null | Field empty | Fill all fields | 1 min |
| Network Error | No internet | Check connection | 1 min |
| CORS Error | Wrong domain | Check .env.local | 2 min |
| Timeout | Server slow | Wait/retry | 1 min |
| Nothing happens | Stuck form | Hard refresh + restart | 3 min |

---

## ✅ Quick Test Script

Copy and run this in browser console to test everything:

```javascript
async function testForm() {
  console.log('🧪 Starting form submission test...');
  
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ Missing env variables!');
    return;
  }
  
  console.log('✅ Env variables found');
  
  const testData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    status: 'pending',
    access_status: 'pending',
    created_at: new Date().toISOString()
  };
  
  console.log('📤 Sending test data:', testData);
  
  try {
    const response = await fetch(`${url}/rest/v1/divers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Data inserted:', data);
    } else {
      console.error('❌ FAILED! Status:', response.status);
      console.error('Response:', data);
    }
  } catch (err) {
    console.error('❌ ERROR:', err);
  }
}

testForm();
```

---

## 🎯 Common Questions

**Q: Where do I check if data was saved?**  
A: Supabase Dashboard → Your Project → Tables → divers table

**Q: How do I reset everything?**  
A: 
```sql
-- In Supabase SQL Editor:
DELETE FROM access_requests WHERE diver_id IS NOT NULL;
DELETE FROM divers;
```

**Q: Can I test without submitting the form?**  
A: Yes! Run the "Quick Test Script" above

**Q: How long should submission take?**  
A: 1-3 seconds normally

**Q: What if it takes longer?**  
A: May be network issue, wait 10 seconds and check console

---

## 📞 Still Need Help?

1. **Check:** [FORM_ERROR_DEBUG.md](./FORM_ERROR_DEBUG.md) - Detailed debugging guide
2. **Run:** The "Quick Test Script" above
3. **Verify:** RLS policies are created in Supabase
4. **Check:** .env.local file has correct values
5. **Restart:** Dev server and browser

---

**Status:** Ready to diagnose  
**Version:** 1.0.0  
**Last Updated:** December 23, 2025  

**⏱️ Average fix time: 5-15 minutes**
