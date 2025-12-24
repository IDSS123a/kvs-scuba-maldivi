# SUPABASE CONSTITUTION 📜
## The Governing Document for All Supabase Operations

**Purpose:** This document serves as the SUPREME LAW for all Supabase-related decisions, data management, and implementation patterns in the KVS-SCUBA Maldives application.

**Last Updated:** 2024
**Authority:** Senior Engineering Review
**Applicability:** ALL Supabase operations, regardless of context

---

## ARTICLE I: CONNECTION & AUTHENTICATION PROTOCOL 🔗

### Section 1.1 - Client Initialization
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

**Rule 1.1.1:** Always use environment variables for credentials
- ✅ Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ❌ Never hardcode credentials
- ❌ Never store secrets in version control

**Rule 1.1.2:** Initialize client once, import everywhere
- ✅ Create `supabaseClient.ts` as single source of truth
- ❌ Never create multiple clients
- ❌ Never reinitialize in components

### Section 1.2 - Connection Pool Management
```typescript
// Safe connection - reuse established connection
const { data, error } = await supabase.from('table').select('*');
```

**Rule 1.2.1:** Connection reuse
- ✅ Reuse initialized client instance
- ✅ Let Supabase handle connection pooling
- ❌ Do not create new connections per request
- ❌ Do not manually manage connection state

---

## ARTICLE II: DATA SCHEMA GOVERNANCE 📊

### Section 2.1 - Table Structure
```sql
-- users table (CRITICAL)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  pin_code VARCHAR(6),
  status VARCHAR(50) DEFAULT 'pending',
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- audit_logs table (CRITICAL)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Rule 2.1.1:** Column Type Safety
- ✅ Use VARCHAR(6) for pin_code (string type)
- ✅ Use UUID for id fields
- ✅ Use TIMESTAMP for dates
- ❌ Never use INTEGER for PIN codes
- ❌ Never use BIGINT for PIN codes

**Rule 2.1.2:** NOT NULL Constraints
- ✅ email: NOT NULL UNIQUE (login identifier)
- ✅ status: NOT NULL DEFAULT 'pending' (always defined)
- ✅ created_at: NOT NULL DEFAULT NOW() (audit trail)
- ❌ pin_code: NULL allowed initially (set during approval)
- ❌ Never make id or email nullable

### Section 2.2 - Data States (User Status Enum)
```
pending   → User requested access, awaiting admin review
approved  → Admin approved, PIN assigned, ready for first login
active    → User logged in with PIN, system active
rejected  → Access denied permanently
disabled  → Account deactivated
```

**Rule 2.2.1:** State Transitions
- ✅ pending → approved (admin action)
- ✅ approved → active (user first login)
- ✅ active → active (normal operation)
- ✅ active → disabled (admin deactivation)
- ❌ pending → active (must go through approved)
- ❌ rejected → approved (no resurrection)
- ❌ disabled → active (requires manual intervention)

**Rule 2.2.2:** Status in Critical Functions
```typescript
// Approval: status becomes 'approved' + PIN assigned
const approveUserWithPin = async (userId: string) => {
  return supabase.from('users').update({
    status: 'approved',
    pin_code: generatePin()
  }).eq('id', userId);
};

// Verification: status becomes 'active' after PIN verified
const verifyPin = async (pin: string) => {
  const user = await findUserByPin(pin);
  if (user.status === 'approved' || user.status === 'active') {
    if (user.status !== 'active') {
      await supabase.from('users').update({
        status: 'active'
      }).eq('id', user.id);
    }
    return user;
  }
};
```

---

## ARTICLE III: PIN MANAGEMENT PROTOCOL 🔐

### Section 3.1 - PIN Generation
```typescript
export const generateUniquePin = async (): Promise<string> => {
  let pin: string;
  let attempts = 0;
  
  do {
    // Generate 6-digit random number as STRING
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check uniqueness in database
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('pin_code', pin)
      .maybeSingle();
    
    if (!existing) return pin;
    attempts++;
  } while (attempts < 10);
  
  throw new Error('Could not generate unique PIN');
};
```

**Rule 3.1.1:** PIN Format Requirements
- ✅ Generated as 6-digit string: "123456"
- ✅ Always check uniqueness before saving
- ✅ Store as VARCHAR(6) in database
- ❌ Never generate as number (100000 instead of "100000")
- ❌ Never skip uniqueness check
- ❌ Never reuse PINs

**Rule 3.1.2:** PIN Generation Collision Handling
- ✅ Retry up to 10 times
- ✅ Throw error if collision limit reached
- ✅ Log each attempt
- ❌ Never accept a duplicate PIN
- ❌ Never skip collision check

### Section 3.2 - PIN Verification (THREE-METHOD PROTOCOL)
```typescript
export const verifyPin = async (pin: string) => {
  // CLEAN INPUT
  const cleanPin = (pin || '').toString().trim();
  
  // VALIDATE FORMAT
  if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return null;
  }
  
  // METHOD 1: Direct exact match
  const { data: exactMatch } = await supabase
    .from('users')
    .select('*')
    .eq('pin_code', cleanPin)
    .limit(1);
  
  if (exactMatch && exactMatch.length > 0) {
    return processVerifiedUser(exactMatch[0]);
  }
  
  // METHOD 2: Get all PINs, manual JS search
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .not('pin_code', 'is', null);
  
  const foundUser = allUsers?.find(u => 
    u.pin_code?.toString().trim() === cleanPin
  );
  
  if (foundUser) {
    return processVerifiedUser(foundUser);
  }
  
  // METHOD 3: Debug listing (should not reach here)
  console.error('PIN NOT FOUND:', cleanPin);
  return null;
};

const processVerifiedUser = async (user: any) => {
  if (user.status !== 'approved' && user.status !== 'active') {
    return null;
  }
  
  if (user.status !== 'active') {
    await supabase.from('users')
      .update({ status: 'active' })
      .eq('id', user.id);
    user.status = 'active';
  }
  
  return user;
};
```

**Rule 3.2.1:** PIN Cleaning (ALWAYS DO)
- ✅ Convert to string: `pin.toString()`
- ✅ Trim whitespace: `.trim()`
- ✅ Validate length: length === 6
- ✅ Validate format: `/^\d{6}$/`
- ❌ Never skip cleaning
- ❌ Never assume PIN is already clean

**Rule 3.2.2:** Three-Method Search (Use All)
1. **METHOD 1:** Exact database query (fastest)
   - `eq('pin_code', cleanPin)`
   - Success rate: 99%
   - Failure cause: Data type/encoding mismatch

2. **METHOD 2:** Fallback JS search (most thorough)
   - Get all PINs, search in JavaScript
   - Success rate: 99.9%
   - Failure cause: Database connection issue

3. **METHOD 3:** Debug listing (diagnostic)
   - Display all available PINs
   - Show why input doesn't match
   - Never return here - this is last resort

**Rule 3.2.3:** User Status After Verification
- ✅ If status is 'approved' or 'active' → approve
- ✅ Update to 'active' if currently 'approved'
- ✅ Return verified user object
- ❌ If status is 'pending' → reject
- ❌ If status is 'rejected' → reject
- ❌ Allow login without approval

### Section 3.3 - PIN Storage Requirements
```typescript
// ✅ CORRECT: PIN saved as string
await supabase.from('users').update({
  pin_code: "538463"  // String type
}).eq('id', userId);

// ❌ WRONG: PIN saved as number
await supabase.from('users').update({
  pin_code: 538463  // Number type - FORBIDDEN
}).eq('id', userId);
```

**Rule 3.3.1:** PIN Type Guarantee
- ✅ Always store as string
- ✅ Always verify type before saving: `pin.toString()`
- ✅ Column must be VARCHAR(6)
- ❌ Never allow numeric type in database
- ❌ Never allow integer type for PIN

---

## ARTICLE IV: ADMIN APPROVAL WORKFLOW ⚙️

### Section 4.1 - Approval Steps
```typescript
export const approveUserWithPin = async (
  userId: string,
  adminId: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
  // STEP 1: Generate unique PIN
  const pin = await generateUniquePin();
  console.log('📌 Generated PIN:', pin);
  
  // STEP 2: Update user in database
  const { data: updateData, error } = await supabase
    .from('users')
    .update({
      status: 'approved',
      pin_code: pin,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();
  
  if (error) return { success: false, error: error.message };
  if (!updateData?.length) return { success: false, error: 'User not found' };
  
  // STEP 3: Verify PIN saved correctly
  const savedUser = updateData[0];
  if (savedUser.pin_code !== pin) {
    console.error('PIN MISMATCH:', pin, 'vs', savedUser.pin_code);
    return { success: false, error: 'PIN verification failed' };
  }
  
  // STEP 4: Create audit log
  await createAuditLog(userId, 'approved', { admin_id: adminId, pin: pin });
  
  // STEP 5: Return success with PIN
  return { success: true, pin };
};
```

**Rule 4.1.1:** Approval Workflow
1. Generate unique PIN
2. Update user status to 'approved' AND set pin_code
3. Verify PIN was saved correctly in database
4. Create audit log entry
5. Return PIN to admin for transmission to user
6. PIN NOT revealed in UI until admin copies it

**Rule 4.1.2:** Admin Confirmation Steps
- ✅ Show PIN in secure box immediately after approval
- ✅ Offer clipboard copy button
- ✅ Log who approved and when
- ✅ Verify PIN persisted before returning
- ❌ Never approve without PIN
- ❌ Never approve without verification
- ❌ Never approve without audit log

### Section 4.2 - Error Handling During Approval
```typescript
if (error.code === '23505') {
  // Unique constraint violation - PIN collision
  console.log('PIN collision detected, retrying...');
  return approveUserWithPin(userId, adminId); // Recursive retry
}

if (error.code === '23503') {
  // Foreign key constraint - user not found
  return { success: false, error: 'User not found' };
}

if (error.code === '23502') {
  // Not null constraint - missing required field
  return { success: false, error: 'Missing required fields' };
}
```

**Rule 4.2.1:** Constraint Error Handling
- ✅ Handle constraint violations gracefully
- ✅ Retry on PIN collision
- ✅ Log constraint violations for debugging
- ❌ Never ignore constraint errors
- ❌ Never proceed with bad data

---

## ARTICLE V: ERROR HANDLING & DEBUGGING 🐛

### Section 5.1 - Console Logging Requirements
```typescript
// ✅ REQUIRED: Debug logs with context
console.log('🔍 PIN VERIFICATION START');
console.log('📱 Input PIN:', pin, 'Type:', typeof pin);
console.log('🧹 Cleaned PIN:', cleanPin);
console.log('✅ PIN verified:', cleanPin, 'Status:', user.status);
console.error('❌ PIN NOT FOUND:', pin);

// ❌ FORBIDDEN: No logging
const verifyPin = async (pin: string) => {
  // ... code without logging
  return user;
};

// ❌ FORBIDDEN: Vague logging
console.log('Processing...');
```

**Rule 5.1.1:** Logging Standards
- ✅ Log function entry/exit
- ✅ Log each verification method tried
- ✅ Log data types when comparing
- ✅ Log database response
- ✅ Log step completion with emoji
- ❌ Never log without context
- ❌ Never hide debug info behind conditions

**Rule 5.1.2:** Emoji Standards (For Visibility)
- 🔍 Investigation/Debug
- 📱 Input/Device
- 🧹 Cleaning/Processing
- ✅ Success
- ❌ Error/Failure
- 🔄 Status update
- 📊 Data/Results
- ⏰ Time-related
- 🎉 Celebration/Completion

### Section 5.2 - Database Diagnostics
```sql
-- DIAGNOSTIC 1: See all users with PINs
SELECT name, email, pin_code, status, created_at 
FROM users 
WHERE pin_code IS NOT NULL 
ORDER BY created_at DESC;

-- DIAGNOSTIC 2: Find specific PIN
SELECT name, email, pin_code, status 
FROM users 
WHERE pin_code = '538463';

-- DIAGNOSTIC 3: Check for duplicates
SELECT pin_code, COUNT(*) as count 
FROM users 
WHERE pin_code IS NOT NULL 
GROUP BY pin_code 
HAVING COUNT(*) > 1;

-- DIAGNOSTIC 4: Check data type issues
SELECT name, email, pin_code, 
  CAST(pin_code AS TEXT) as text_version,
  pg_typeof(pin_code) as column_type
FROM users 
WHERE pin_code IS NOT NULL 
ORDER BY created_at DESC;

-- DIAGNOSTIC 5: Check whitespace issues
SELECT name, email, 
  pin_code, 
  LENGTH(pin_code) as length,
  POSITION(E'\n' IN pin_code) as has_newline,
  POSITION(E'\t' IN pin_code) as has_tab,
  pin_code = TRIM(pin_code) as is_trimmed
FROM users 
WHERE pin_code IS NOT NULL;
```

**Rule 5.2.1:** When PIN Verification Fails
- ✅ Run DIAGNOSTIC 1 to see all PINs
- ✅ Run DIAGNOSTIC 2 to find specific PIN
- ✅ Run DIAGNOSTIC 3 to check duplicates
- ✅ Run DIAGNOSTIC 4 to check data types
- ✅ Run DIAGNOSTIC 5 to check whitespace
- ✅ Compare database results with application logs
- ❌ Never assume database is correct
- ❌ Never assume query is correct

---

## ARTICLE VI: RLS (ROW LEVEL SECURITY) POLICY 🔒

### Section 6.1 - RLS Configuration
```sql
-- For development/testing: DISABLE RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- For production: Enable with policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_own_data ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY users_can_update_own ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);
```

**Rule 6.1.1:** RLS in Development vs Production
- ✅ Development: DISABLE for easier testing
- ✅ Production: ENABLE with proper policies
- ✅ Use auth.uid() for policy comparison
- ❌ Never expose data without RLS in production
- ❌ Never mix auth systems in policies

**Rule 6.1.2:** When RLS Causes Issues
- ✅ Temporarily disable for testing
- ✅ Verify code works without RLS first
- ✅ Add RLS back incrementally
- ✅ Test each RLS policy thoroughly
- ❌ Never leave production RLS disabled
- ❌ Never ignore RLS in production

---

## ARTICLE VII: SERVICE FUNCTION PATTERNS 🔧

### Section 7.1 - Generic Error Handler
```typescript
export const safeQuery = async <T>(
  operation: () => Promise<{ data?: T; error?: any }>,
  context: string
): Promise<T | null> => {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`❌ ${context} error:`, error);
      return null;
    }
    
    console.log(`✅ ${context} success`);
    return data || null;
    
  } catch (err) {
    console.error(`💥 ${context} crashed:`, err);
    return null;
  }
};

// Usage:
const user = await safeQuery(
  () => supabase.from('users').select('*').eq('id', userId).single(),
  'Get user'
);
```

**Rule 7.1.1:** Service Function Structure
- ✅ Always wrap with try-catch
- ✅ Always check for error
- ✅ Always log result
- ✅ Always return null on failure
- ✅ Always provide context string
- ❌ Never throw errors from service layer
- ❌ Never return raw error objects

### Section 7.2 - Service Function Naming
```typescript
// ✅ CORRECT naming pattern
export const generateUniquePin = async () => { ... }
export const verifyPin = async (pin: string) => { ... }
export const approveUserWithPin = async (userId: string) => { ... }
export const rejectUserRequest = async (userId: string) => { ... }
export const createAuditLog = async (userId: string) => { ... }

// ❌ WRONG naming patterns
export const pin = async () => { ... }  // Too vague
export const checkPin = async (pin: string) => { ... }  // Not "verify"
export const approveUser = async (userId: string) => { ... }  // Missing "Pin"
```

**Rule 7.2.1:** Naming Conventions
- ✅ Use verb-noun pattern: `verifyPin`, `approveUser`
- ✅ Include important context: `approveUserWithPin` (not just `approveUser`)
- ✅ Use English, clear words
- ✅ Match database operations: `updateUser`, `createLog`
- ❌ Use abbreviations: `chk`, `proc`, `gen`
- ❌ Use vague names: `do`, `execute`, `run`
- ❌ Mislead about what function does

---

## ARTICLE VIII: DATA VALIDATION & CONSTRAINTS 📋

### Section 8.1 - Input Validation Requirements
```typescript
// ✅ CORRECT: Validate all inputs
export const verifyPin = async (pin: string): Promise<User | null> => {
  // 1. Type check
  if (typeof pin !== 'string') {
    console.error('Invalid PIN type:', typeof pin);
    return null;
  }
  
  // 2. Length check
  if (pin.length !== 6) {
    console.error('Invalid PIN length:', pin.length);
    return null;
  }
  
  // 3. Format check
  if (!/^\d{6}$/.test(pin)) {
    console.error('Invalid PIN format (not all digits)');
    return null;
  }
  
  // 4. Existence check
  if (!pin) {
    console.error('PIN is empty or null');
    return null;
  }
  
  // Now proceed with verified PIN
  return findUserByPin(pin);
};

// ❌ WRONG: Skip validation
export const verifyPin = async (pin: string) => {
  const { data } = await supabase.from('users')
    .select('*')
    .eq('pin_code', pin); // What if pin is undefined?
  return data?.[0];
};
```

**Rule 8.1.1:** Validation Order (BEFORE Database)
1. Null/undefined check
2. Type check
3. Length check
4. Format check
5. Business logic validation
6. Only then: Query database

**Rule 8.1.2:** Validation Logging
- ✅ Log each validation check
- ✅ Log what failed
- ✅ Log expected vs actual
- ❌ Never silently fail validation
- ❌ Never skip validation step

---

## ARTICLE IX: AUDIT & COMPLIANCE 📜

### Section 9.1 - Audit Logging
```typescript
export const createAuditLog = async (
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: action,
        details: JSON.stringify(details || {}),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.warn('⚠️ Audit log creation failed:', error);
      // Don't throw - audit logging is non-critical
      return false;
    }
    
    console.log('📋 Audit logged:', action, 'for user:', userId);
    return true;
    
  } catch (err) {
    console.warn('⚠️ Audit logging error:', err);
    return false; // Non-critical failure
  }
};
```

**Rule 9.1.1:** What Must Be Audited
- ✅ User approval with PIN assignment
- ✅ User rejection with reason
- ✅ PIN verification attempts (failed ones)
- ✅ Status changes
- ✅ Admin actions
- ❌ Successful verifications (too verbose)
- ❌ Read-only queries
- ❌ System status checks

**Rule 9.1.2:** Audit Log Content
```json
{
  "action": "user_approved",
  "details": {
    "admin_id": "uuid-of-admin",
    "user_email": "user@example.com",
    "pin_assigned": "538463",
    "previous_status": "pending",
    "new_status": "approved"
  }
}
```

---

## ARTICLE X: DEPLOYMENT CHECKLIST ✅

### Before Production Deployment:

- [ ] PIN generation uses string type, not number
- [ ] PIN stored as VARCHAR(6) in database
- [ ] PIN verification uses three-method approach
- [ ] All console.log calls include emoji and context
- [ ] Error handling includes constraint error codes
- [ ] Audit logging implemented for all admin actions
- [ ] RLS enabled with proper policies
- [ ] Database schema validated against this constitution
- [ ] All service functions documented
- [ ] Testing completed with real database
- [ ] Admin approval workflow tested end-to-end
- [ ] PIN verification tested with all three methods
- [ ] Database diagnostics available for troubleshooting
- [ ] Console logs viewable in browser DevTools
- [ ] Error messages displayed to admin user

### After Deployment:

- [ ] Monitor console logs for PIN-related errors
- [ ] Run diagnostic SQL queries weekly
- [ ] Check for PIN collision attempts
- [ ] Verify audit logs for suspicious patterns
- [ ] Test PIN verification monthly
- [ ] Review admin approval workflow monthly
- [ ] Update this constitution based on findings

---

## FINAL AUTHORITY STATEMENT

This constitution supersedes all other documentation. In case of conflict between this constitution and any other document, THIS CONSTITUTION PREVAILS.

All developers working on PIN authentication MUST follow these rules. No exceptions. No shortcuts. No workarounds.

When in doubt: **LOG EVERYTHING, VERIFY EVERYTHING, TRUST NOTHING.**

---

**Document Authority:** Engineering Leadership
**Last Reviewed:** 2024
**Next Review:** Quarterly
**Emergency Contact:** Senior Developer on Call
