# ✅ SUPABASE AUTHENTICATION - COMPREHENSIVE TESTING GUIDE

**Status:** Testing & Verification Guide  
**Date:** December 24, 2025  
**All Critical Bugs:** FIXED  

---

## 🧪 TESTING SCENARIOS

### SCENARIO 1: User Registration (Access Request)
**What it tests:** User can request access without being approved yet

**Steps:**
1. Click "Request Access" button
2. Fill in:
   - Name: "Test User 1"
   - Email: "test1@example.com"
   - Phone: "+387 61 123456"
3. Click "Submit Request"

**Expected Result:**
- ✅ Message: "Your Request Was Sent!"
- ✅ Database shows new user with status='pending'
- ✅ PIN field is NULL

**Commands to verify in Supabase:**
```sql
SELECT id, name, email, status, pin_code, created_at 
FROM users 
WHERE email = 'test1@example.com';
```

Expected output:
```
id:        uuid
name:      Test User 1
email:     test1@example.com
status:    pending
pin_code:  NULL
created_at: 2025-12-24T...
```

---

### SCENARIO 2: Login Before Approval (SHOULD FAIL)
**What it tests:** Pending users CANNOT login

**Steps:**
1. Try to login with PIN
2. Click "Request Access"
3. Go back to PIN login
4. Fill any PIN (e.g., "111111")
5. Click "Verify PIN"

**Expected Result:**
- ❌ Error: "Invalid PIN. Please try again."
- ❌ Access DENIED
- ✅ Audit log created for failed attempt

**Commands to verify:**
```sql
SELECT id, email, pin_code, status 
FROM users 
WHERE email = 'test1@example.com';
```

Should show: `pin_code = NULL, status = pending`

---

### SCENARIO 3: Admin Approves User
**What it tests:** Admin can approve user and generate PIN

**Steps:**
1. Admin goes to Admin Panel (if exists)
2. Finds "Test User 1" in pending list
3. Clicks "Approve" button
4. System generates 6-digit PIN

**Expected Result:**
- ✅ User status changes: pending → approved
- ✅ Unique PIN generated (e.g., "567890")
- ✅ approved_at timestamp set
- ✅ approved_by = admin user ID
- ✅ Audit log: "user_approved"

**Database check:**
```sql
SELECT id, email, status, pin_code, approved_at, approved_by 
FROM users 
WHERE email = 'test1@example.com';
```

Expected output:
```
status:    approved
pin_code:  567890
approved_at: 2025-12-24T...
approved_by: [admin uuid]
```

---

### SCENARIO 4: User Logins with PIN
**What it tests:** Approved user can login with PIN

**Steps:**
1. User enters PIN from approval email
2. Clicks "Verify PIN"
3. System checks PIN

**Expected Result:**
- ✅ User authenticated successfully
- ✅ Status changes: approved → active
- ✅ last_login timestamp updated
- ✅ Audit log: "pin_verified"
- ✅ User redirected to main app
- ✅ onLogin callback triggered with user data

**Database check:**
```sql
SELECT id, email, status, pin_code, last_login, pin_attempt_count
FROM users 
WHERE email = 'test1@example.com';
```

Expected output:
```
status:             active
pin_code:           567890
last_login:         2025-12-24T...
pin_attempt_count:  0
```

---

### SCENARIO 5: Invalid PIN (SHOULD FAIL)
**What it tests:** System rejects invalid PIN

**Steps:**
1. Approved user tries to login
2. Enters WRONG PIN (e.g., "000000")
3. Clicks "Verify PIN"

**Expected Result:**
- ❌ Error: "Invalid PIN. Please try again."
- ✅ Status stays "approved"
- ✅ pin_attempt_count increases
- ✅ Audit log: "pin_invalid"

**Database check:**
```sql
SELECT pin_attempt_count FROM users WHERE email = 'test1@example.com';
```

After 1 failed attempt: `pin_attempt_count = 1`
After 3 failed attempts: `pin_attempt_count = 3`

---

### SCENARIO 6: Rate Limiting (SHOULD FAIL)
**What it tests:** Prevent brute force attacks

**Steps:**
1. User tries PIN 5 times (all wrong)
2. Tries 6th time

**Expected Result:**
- ❌ Error: "Too many attempts. Try again in 5 minutes."
- ✅ User locked out: locked_until = NOW + 5min
- ✅ Audit log: "pin_lockout"

**Database check:**
```sql
SELECT pin_attempt_count, locked_until 
FROM users 
WHERE email = 'test1@example.com';
```

---

### SCENARIO 7: Duplicate Registration (SHOULD FAIL)
**What it tests:** Same email can't register twice

**Steps:**
1. User registers with email "test1@example.com"
2. User tries to register AGAIN with same email
3. System checks for existing user

**Expected Result:**
- ❌ Error: "⚠️ You already have a pending request. Please wait for administrator approval."
- ✅ No duplicate record created

**Database check:**
```sql
SELECT COUNT(*) FROM users WHERE email = 'test1@example.com';
```

Should show: 1 record only

---

### SCENARIO 8: Duplicate PIN Prevention
**What it tests:** No two users can have same PIN

**Steps:**
1. Admin approves User 1 → PIN = 123456
2. Admin approves User 2
3. System generates PIN for User 2

**Expected Result:**
- ✅ User 2 gets DIFFERENT PIN (not 123456)
- ✅ All PINs are unique
- ✅ System retried if collision found

**Database check:**
```sql
SELECT email, pin_code, status 
FROM users 
WHERE status IN ('approved', 'active')
ORDER BY pin_code;
```

All pin_code values should be UNIQUE

---

### SCENARIO 9: Reject User
**What it tests:** Admin can reject access requests

**Steps:**
1. Admin finds pending user
2. Clicks "Reject" button
3. Admin enters reason

**Expected Result:**
- ✅ Status changes: pending → rejected
- ✅ rejection_reason stored
- ✅ rejected_at timestamp set
- ✅ rejected_by = admin ID

**Database check:**
```sql
SELECT status, rejection_reason, rejected_at, rejected_by 
FROM users 
WHERE email = 'test1@example.com';
```

---

### SCENARIO 10: Admin User Management
**What it tests:** Admin can manage all users

**Steps:**
1. Admin views all pending requests
2. Admin filters by status
3. Admin exports user list

**Expected Result:**
- ✅ View shows all pending users
- ✅ Filter works (pending/approved/active)
- ✅ Can approve/reject users
- ✅ Can view audit logs

---

## 🔍 AUDIT LOG VERIFICATION

### Check all PIN verification attempts:
```sql
SELECT * FROM audit_logs WHERE action = 'pin_verified' ORDER BY created_at DESC;
```

### Check all rejections:
```sql
SELECT * FROM audit_logs WHERE action = 'user_rejected' ORDER BY created_at DESC;
```

### Check all approvals:
```sql
SELECT * FROM audit_logs WHERE action = 'user_approved' ORDER BY created_at DESC;
```

### Check all failed PIN attempts:
```sql
SELECT * FROM pin_attempts WHERE success = FALSE ORDER BY created_at DESC LIMIT 10;
```

---

## 📊 STATUS FLOW

```
                    ┌─────────────┐
                    │  REGISTER   │
                    │  (pending)  │
                    └──────┬──────┘
                           │
                    ┌──────▼─────────┐
                    │  ADMIN CHECK   │
                    └──────┬────────┬┘
                           │        │
                    ┌──────▼───┐    │
                    │ APPROVED │    │
                    │(PIN sent)│    │
                    └──────┬───┘    │
                           │        │
                  ┌────────▼──────┐ │
                  │ USER LOGINS   │ │
                  │  (with PIN)   │ │
                  └────────┬──────┘ │
                           │        │
                    ┌──────▼─┐      │
                    │ ACTIVE │      │
                    └────────┘      │
                                    │
                            ┌───────▼────────┐
                            │   REJECTED     │
                            │ (no more steps)│
                            └────────────────┘
```

---

## 🚨 ERROR SCENARIOS

### What SHOULD fail:

1. **Pending user tries to login** → ❌ Invalid PIN
2. **Wrong PIN entered** → ❌ Invalid PIN
3. **5 wrong PINs** → ❌ Locked for 5 minutes
4. **Same email registers twice** → ❌ Already has pending request
5. **Non-admin tries to approve user** → ❌ Access denied (RLS)

### What SHOULD succeed:

1. ✅ New user registers
2. ✅ Admin approves user
3. ✅ User receives unique PIN
4. ✅ User logins with correct PIN
5. ✅ Status changes to active
6. ✅ Audit logs all actions

---

## ✅ CHECKLIST BEFORE PRODUCTION

- [ ] All 10 scenarios tested
- [ ] All audit logs created correctly
- [ ] All status transitions working
- [ ] PIN uniqueness verified (no duplicates)
- [ ] Rate limiting working (lockout after 5 attempts)
- [ ] Duplicate registration prevented
- [ ] Admin can approve/reject users
- [ ] Rejected users blocked from login
- [ ] RLS policies enabled and tested
- [ ] Non-admin cannot see other users' PINs
- [ ] Email verification working (if applicable)
- [ ] First login triggers status → active
- [ ] Last login timestamp updates
- [ ] Audit logs show all actions

---

## 🐛 TROUBLESHOOTING

### Problem: PIN always returns "Invalid"
**Check:**
```sql
-- 1. Does user exist with status='approved'?
SELECT * FROM users WHERE status = 'approved';

-- 2. Is PIN code stored correctly?
SELECT email, pin_code, LENGTH(pin_code) FROM users WHERE status = 'approved';

-- 3. Check recent audit logs
SELECT * FROM audit_logs WHERE action LIKE '%pin%' ORDER BY created_at DESC;
```

### Problem: Status not changing to "active"
**Check:**
```sql
-- 1. Is trigger working?
SELECT * FROM pg_trigger WHERE tgname = 'update_users_last_login';

-- 2. Last update to user
SELECT updated_at, last_login, status FROM users ORDER BY updated_at DESC LIMIT 1;
```

### Problem: Cannot see pending users as admin
**Check:**
```sql
-- 1. Are RLS policies enabled?
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- 2. Check your role
SELECT role FROM users WHERE id = auth.uid();

-- 3. Check policy
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## 📞 CONTACT

If issues persist after testing:
1. Check browser console for errors
2. Check Supabase logs
3. Run verification queries above
4. Review SUPABASE_CRITICAL_ERRORS.md for more details

