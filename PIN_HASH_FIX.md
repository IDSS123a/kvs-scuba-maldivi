# PIN Hash Generation - Correct Format

The PIN hash stored in the database must be created with **PBKDF2 (Web Crypto API)**, not SQL `crypt()`.

## Solution

You have 2 options:

---

## Option 1: Generate Hash Manually (3 minutes)

Run this in your **browser console** to generate the correct hash:

```javascript
async function generatePinHash(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const hashBuffer = await crypto.subtle.exportKey('raw', key);
  const hashArray = new Uint8Array(hashBuffer);
  const saltArray = new Uint8Array(salt);
  
  const combined = new Uint8Array(saltArray.length + hashArray.length);
  combined.set(saltArray, 0);
  combined.set(hashArray, saltArray.length);
  
  const hash = btoa(String.fromCharCode.apply(null, Array.from(combined)));
  return hash;
}

// Generate hash for PIN 123456
generatePinHash('123456').then(hash => {
  console.log('PIN Hash:');
  console.log(hash);
  console.log('Copy this and use in SQL UPDATE below');
});
```

**Steps:**
1. Open browser console (F12)
2. Paste the code above
3. Wait for output (a long Base64 string)
4. Copy the hash
5. Run this SQL in Supabase (replace HASH_HERE):

```sql
UPDATE divers 
SET access_pin_hash = 'PASTE_HASH_HERE'
WHERE name = 'Davor Mulalić';
```

---

## Option 2: Bypass PIN Temporarily (Immediate)

If you just want to login as admin right now, we can modify the Auth component to skip PIN verification for admin:

The `mulalic71@gmail.com` email is already recognized as admin by the AuthProvider, so we can add a special case.

Would you prefer this approach to get logged in immediately?

---

## Why This Happened

- ✅ The app uses **PBKDF2** for PIN hashing (Web Crypto API)
- ❌ We tried using SQL `crypt()` which is **bcrypt** (different format)
- ❌ The `comparePin()` function can't decode bcrypt hashes
- ✅ Need to generate correct **Base64-encoded PBKDF2** hash

---

## Quickest Solution: Admin Bypass

To get you logged in immediately as admin, we can:

1. Detect that your email (`mulalic71@gmail.com`) is admin
2. Skip PIN check for admin users
3. Let you login with any PIN or no PIN

Would you like me to modify the Auth component to do this?

---

**Recommendation:** Use Option 2 (Admin Bypass) to get logged in immediately, then we can set up proper PIN hashing later.
