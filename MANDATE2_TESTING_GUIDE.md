# Mandate 2: Authentication & User Flow Testing Guide

## Prerequisites
- Mandate 1 complete: Database schema created from scratch ✅
- Supabase SQL migration executed ✅
- Dev server running on `localhost:3000` ✅

## Setup: Configure Davor's PIN

**Execute in Supabase SQL Editor:**

```sql
UPDATE users 
SET pin_code = '1919' 
WHERE email = 'mulalic71@gmail.com';

-- Verify
SELECT email, name, role, status, pin_code
FROM users 
WHERE email = 'mulalic71@gmail.com';
```

**Expected Result:**
```
mulalic71@gmail.com | Davor Mulalić | admin | active | 1919
```

---

## Test 1: PIN Verification (Admin Login)

### Steps
1. Open `http://localhost:3000` in browser
2. Click "Enter PIN" (should be default tab)
3. Enter PIN: `1919`
4. Click "Verify PIN"

### Expected Results
- ✅ Console shows `[PIN Service] ✅ User found: mulalic71@gmail.com`
- ✅ Success screen appears with "Access Granted!" message
- ✅ Redirects to main dashboard/application
- ✅ User context shows: Davor Mulalić, email: mulalic71@gmail.com, role: admin

### Failure Diagnosis
- **Error: "Invalid PIN"** → Check if PIN is exactly `1919` in database
- **Error: "No active user found"** → Verify user status is `active` in database
- **No redirect** → Check Auth context implementation (Task B3)

---

## Test 2: Access Request Form

### Steps
1. Open `http://localhost:3000`
2. Click "Request Access" button
3. Fill form:
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Phone: `+1234567890` (optional)
4. Click "Submit Request"

### Expected Results
- ✅ Console shows `[Audit] ✅ Logged action: requested`
- ✅ Success message appears: "Your request has been sent to organizers"
- ✅ Form clears after 3 seconds
- ✅ New record appears in `users` table with:
  - email: `testuser@example.com`
  - status: `pending`
  - pin_code: `null`
  - role: `member`

### SQL Verification
```sql
SELECT id, email, name, status, pin_code, role, created_at
FROM users
WHERE email = 'testuser@example.com';
```

**Expected:**
- status = `pending`
- pin_code is NULL
- role = `member`

### Failure Diagnosis
- **Error: "Email already registered"** → Test email already exists, use different email
- **Error submitting request** → Check browser console for RLS policy errors
- **No audit log entry** → Verify `access_requests_audit` table exists

---

## Test 3: Duplicate Request Prevention

### Steps
1. Try submitting Access Request again with same email (`testuser@example.com`)

### Expected Results
- ✅ Error message: "You already submitted a request. Please wait..."
- ❌ Form should NOT create duplicate

### Failure Diagnosis
- Duplicate created → The form logic doesn't check existing users properly

---

## Test 4: User Status Transitions (Admin Only)

**This requires accessing the Admin panel (Task B3).**

### Expected Flow
1. Admin logs in with PIN `1919`
2. Navigates to Admin → Pending Requests
3. Sees "Test User" (testuser@example.com) in pending list
4. Clicks "Approve" button
5. System generates unique PIN and sends it to user
6. User's status changes to `approved`
7. User can now log in with the new PIN

### SQL Verification After Approval
```sql
SELECT id, email, name, status, pin_code, approved_at, approved_by
FROM users
WHERE email = 'testuser@example.com';
```

**Expected:**
- status = `approved`
- pin_code = some 6-digit number (NOT null)
- approved_at = recent timestamp
- approved_by = Davor's user ID

---

## Test 5: New User Login with Generated PIN

### Steps
1. Logout from admin
2. Go back to login screen
3. Enter the PIN that was generated for Test User
4. Should successfully log in as Test User

### Expected Results
- ✅ User status automatically updates to `active`
- ✅ Can access main app (not admin area)
- ✅ Console shows `[PIN Service] ✅ User found: testuser@example.com`

---

## Console Logging Guide

### Successful PIN Verification
```
[PIN Service] Verifying PIN: 1919
[PIN Service] ✅ User found: mulalic71@gmail.com
[Audit] ✅ Logged action: pin_verified
```

### Successful Access Request
```
📝 Submitting access request: {name, email, phone}
✅ New user registered: {id, email, name, status: 'pending'}
[Audit] ✅ Logged action: requested
```

### Failed PIN Verification
```
[PIN Service] Verifying PIN: 1234
[PIN Service] Query error: (actual error from Supabase)
[PIN Service] ❌ No active user found with this PIN
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| RLS Policy Error 403 | Row Level Security blocking query | Verify RLS policies created in migration |
| PIN returns empty array | User status not 'active' | Check user status in database |
| Auth context not updating | Login callback not setting user state | Verify Auth.tsx callback logic |
| Form won't submit | Email validation or input issues | Check browser console for form errors |
| Duplicate users created | No uniqueness check before insert | Verify email UNIQUE constraint |

---

## Completion Checklist

- [ ] PIN login works with '1919' for Davor
- [ ] Access Request form submits new user as 'pending'
- [ ] Duplicate requests are prevented
- [ ] User found in database with correct initial status
- [ ] Admin can see pending requests (once B3 is done)
- [ ] Admin approval generates unique PIN
- [ ] Approved user can login with generated PIN
- [ ] Console shows clean logging (no errors)
- [ ] All role and status transitions are correct

---

## Next Steps

Once all tests pass:
1. **B3: Auth Context & Routes** - Ensure protected routes work
2. **Mandate 3** - Admin features (approve/reject users, manage pins)
