# 🚨 EMERGENCY SYSTEM REBUILD - Testing Protocol

## ⚡ Phase 1: Database Reset (EXECUTE FIRST)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy & Paste SQL**
   - Copy ALL content from [EMERGENCY_DB_RESET.sql](EMERGENCY_DB_RESET.sql)
   - Paste into Supabase SQL Editor
   - Click **RUN**

3. **Verify Success**
   - Should see "Query successful" messages
   - Scroll down to VERIFICATION section
   - Run the verification queries to confirm:
     - ✅ Tables `users` and `audit_logs` exist
     - ✅ Admin user `mulalic71@gmail.com` exists with PIN `123456`
     - ✅ Tables are completely clean/fresh

## 🧪 Phase 2: Test Each Component Independently

### Test 2.1: Database Connection
**Action:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the application (F5)
4. Look for messages about Supabase connection

**Expected:**
```
supabaseClient.ts:X Supabase client instantiated successfully
```

If you see this ✅ then database connection works

---

### Test 2.2: User Registration
**Action:**
1. Go to "Request Access" form
2. Fill in:
   - Name: `Test User`
   - Email: `testuser@example.com`
   - Phone: `123-456-7890`
3. Click **Submit**

**Expected:**
- ✅ Success message appears
- ✅ Console shows no errors
- ✅ Check Supabase: New user appears in `users` table with status=`pending`

**If 500 Error:**
- Check console for exact error message
- Check Supabase project URL is correct
- Check anon key is correct
- Check tables actually exist

---

### Test 2.3: Admin Login
**Action:**
1. Go to PIN login page
2. Enter PIN: `123456`
3. Click **Verify PIN**

**Expected:**
- ✅ Admin user (Davor Mulalic) successfully logs in
- ✅ No errors in console
- ✅ Taken to admin dashboard

**If Fails:**
- Check PIN is exactly `123456`
- Check user exists in database with that PIN
- Check Supabase connection

---

### Test 2.4: Admin Approval Workflow
**Action:**
1. Login as admin (PIN: `123456`)
2. Go to Admin Dashboard → Requests tab
3. See pending user from Test 2.2
4. Click **Approve**

**Expected:**
- ✅ Alert shows generated PIN (e.g., `654321`)
- ✅ User disappears from pending list
- ✅ Check database: user status changed to `approved`, pin_code set
- ✅ Console shows success messages

**If 500 Error:**
- Check console for exact error
- This is usually RLS or bad query
- Restart development server

---

### Test 2.5: PIN Verification (New User)
**Action:**
1. Logout from admin account
2. Go to PIN login page
3. Use the PIN from Test 2.4 (e.g., `654321`)
4. Click **Verify PIN**

**Expected:**
- ✅ New user successfully logs in
- ✅ User status changes to `active` in database
- ✅ No errors in console
- ✅ Taken to user dashboard

**If Fails:**
- Check PIN is correct from Step 2.4
- Check database: user status is `approved`
- Check Supabase connection

---

## 🎯 Phase 3: Success Criteria

All of these must pass ✅:
- [ ] Database tables created successfully
- [ ] Admin user exists and can login with PIN `123456`
- [ ] New users can submit access requests
- [ ] Requests appear in admin dashboard
- [ ] Admin can approve requests (generates PIN)
- [ ] Approved users can login with generated PIN
- [ ] No 500 errors in console
- [ ] No RLS permission errors
- [ ] No database connection errors

---

## 🐛 Troubleshooting

### Error: "Cannot read property 'from' of undefined"
**Cause:** Supabase client not initialized
**Fix:** 
1. Check `.env.local` has `VITE_SUPABASE_URL`
2. Check `.env.local` has `VITE_SUPABASE_ANON_KEY`
3. Restart dev server

### Error: "relation 'users' does not exist"
**Cause:** SQL reset didn't execute properly
**Fix:**
1. Go back to Supabase SQL Editor
2. Run EMERGENCY_DB_RESET.sql again
3. Verify tables exist

### Error: "permission denied" or RLS errors
**Cause:** RLS policies are enabled but shouldn't be yet
**Fix:**
1. Go to Supabase SQL Editor
2. Run: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
3. Run: `ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;`
4. Refresh browser

### 500 Error on any operation
**Cause:** Complex query or RLS issue
**Fix:**
1. Check browser console for exact error
2. Check Supabase logs (SQL Editor)
3. Make sure RLS is DISABLED
4. Check tables exist with correct columns

---

## ✅ Next Steps After All Tests Pass

1. **Verify Audit Logs Work**
   - Check database: `audit_logs` table has entries
   - Should see `pin_verified`, `user_approved` actions

2. **Test Error Scenarios**
   - Try wrong PIN (should show error, not 500)
   - Try registering duplicate email (should show error)
   - Try approving already-approved user (should work or show graceful error)

3. **Only Then:** Add RLS policies one at a time and test

4. **Finally:** Add currency API fixes (lowest priority)

---

## 📝 Emergency Contacts

**If everything fails:**
- Check exact console error message
- Check Supabase SQL Editor for table structure
- Make sure `.env.local` is correct
- Restart development server (`npm run dev`)
- Clear browser cache (Ctrl+Shift+Delete)
- Check Supabase project is accessible

**Key Files:**
- [EMERGENCY_DB_RESET.sql](EMERGENCY_DB_RESET.sql) - Database
- [services/pinService.ts](services/pinService.ts) - PIN logic
- [components/PINVerificationForm.tsx](components/PINVerificationForm.tsx) - PIN verification
- [components/AdminAccessRequestsPanel.tsx](components/AdminAccessRequestsPanel.tsx) - Admin approval

Good luck! 🚀
