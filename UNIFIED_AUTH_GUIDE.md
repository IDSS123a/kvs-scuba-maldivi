# 🚀 UNIFIED AUTHENTICATION SYSTEM - IMPLEMENTATION GUIDE

## 📋 What Changed

Sistem je pretvoren sa stare `divers` tabele na novu `users` tabelu sa integrisanom autentifikacijom i pristupnom kontrolom.

### Old System:
- `divers` table sa `status` (confirmed/pending/cancelled)
- `access_pin_hash` field bez organizacije
- Ad-hoc PIN upravljanje

### New System:
- `users` table - centralizovana baza za sve korisnike
- `access_requests_audit` - kompletna audit trail
- `user_status` enum (pending/approved/rejected/active)
- `user_role` enum (member/admin)
- RLS politike za siguran pristup
- PIN generation funkcije u bazi

---

## 🔧 STEP 1: EXECUTE MIGRATION IN SUPABASE SQL EDITOR

1. **Login na Supabase Dashboard**
   - Idi na: https://app.supabase.com

2. **Otvori SQL Editor**
   - Klikni na "SQL Editor" u lijevoj navigaciji

3. **Kopiraj kompletan SQL iz fajla:**
   ```
   supabase_migration_unified_auth.sql
   ```

4. **Paste SQL u editor i klikni "Run"**
   - ⏳ Čekaj da se izvrši (trebalo bi ~10-30 sekundi)
   - ✅ Trebala bi poruka "Success"

5. **Provjeri da su tabele kreirane:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   
   Trebalo bi da vidiš:
   - ✅ `users`
   - ✅ `access_requests_audit`
   - ✅ `divers` (stara tabela - još uvijek tu)

6. **Provjeri podatke u users:**
   ```sql
   SELECT id, name, email, role, status, pin_code FROM users ORDER BY created_at DESC;
   ```
   
   Trebalo bi da vidiš:
   - 3 admin-a sa `role='admin'` i `status='active'`
   - Sve ostale korisnike sa `role='member'` i `status='pending'`

---

## 🔐 STEP 2: VERIFY RLS POLICIES

```sql
-- Provjeri da li su RLS politike kreirane
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'access_requests_audit')
ORDER BY tablename, policyname;
```

Trebalo bi da vidim:
- ✅ `admins_full_access_users`
- ✅ `users_view_own_data`
- ✅ `allow_new_registration`
- ✅ `prevent_user_self_update`
- ✅ `prevent_user_self_delete`
- ✅ `admins_view_all_audit`
- ✅ `admins_create_audit`

---

## 📱 STEP 3: TEST FRONTEND - NEW WORKFLOW

### Scenario 1: New User Registration
1. Otvori aplikaciju
2. Klikni "Request Access"
3. Unesi:
   - Ime: "Test User"
   - Email: "testuser@example.com"
   - Phone: "+387 61 111 2222"
4. Klikni "Submit Request"
5. Trebalo bi vidjeti: "✅ Request Submitted!"

**Backend verifikacija:**
```sql
SELECT id, name, email, status FROM users WHERE email = 'testuser@example.com';
-- Trebalo bi status='pending'
```

### Scenario 2: Admin Approval
1. Login kao admin (mulalic71@gmail.com sa PIN 999999)
2. Idi na Admin panel → Requests tab
3. Trebalo bi vidjeti "Test User" u pending requests
4. Klikni "Approve"
5. Trebalo bi vidjeti PIN u modalu (npr: 527349)
6. Kopiraj PIN

**Backend verifikacija:**
```sql
SELECT id, name, email, status, pin_code FROM users WHERE email = 'testuser@example.com';
-- Trebalo bi status='approved' i pin_code='527349'
```

### Scenario 3: User PIN Login
1. Logout
2. Na login formi, unesi PIN koji je dobio test korisnik
3. Trebalo bi "✅ Pristup Odobren!"
4. Trebalo bi biti logiran kao "Test User"

**Backend verifikacija:**
```sql
SELECT id, name, email, status, activated_at, last_login 
FROM users WHERE email = 'testuser@example.com';
-- Trebalo bi status='active', activated_at=sada, last_login=sada
```

### Scenario 4: Admin Recovery PIN
1. Logout
2. Na login formi, unesi PIN: **999999**
3. Trebalo bi biti logiran kao admin

---

## 🛑 TROUBLESHOOTING

### Problem: "PIN table not found"
- **Rješenje:** SQL migration nije izvršena. Ponovi STEP 1.

### Problem: "Error: user doesn't have RLS policy access"
- **Rješenje:** RLS politike nisu kreirane. Provjeri STEP 2.

### Problem: "New registration fails with 403"
- **Rješenje:** RLS politika `allow_new_registration` možda nije aktivna. Provjeri u SQL editoru.

### Problem: "Admin can't create PIN"
- **Rješenje:** Admin user možda nema `role='admin'`. Provjeri sa:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'mulalic71@gmail.com';
  ```

### Problem: "Generated PIN doesn't work"
- **Rješenje:** PIN se možda ne sprema u bazu. Provjeri:
  1. Admin panel console za greške
  2. Direktno u SQL: `SELECT pin_code FROM users WHERE email = 'test@example.com';`

---

## 📊 DATABASE STRUCTURE

### users table
```sql
id (UUID) - Primary Key
email (TEXT) - UNIQUE
name (TEXT)
phone (TEXT)
pin_code (VARCHAR 6) - UNIQUE
role (user_role) - 'member' | 'admin'
status (user_status) - 'pending' | 'approved' | 'rejected' | 'active'
created_at (TIMESTAMPTZ)
approved_at (TIMESTAMPTZ)
approved_by (UUID) - FK to users
rejected_at (TIMESTAMPTZ)
rejection_reason (TEXT)
activated_at (TIMESTAMPTZ)
last_login (TIMESTAMPTZ)
+ metadata fields (birth_date, age, etc.)
```

### access_requests_audit table
```sql
id (UUID) - Primary Key
user_id (UUID) - FK to users
action (VARCHAR) - 'requested' | 'approved' | 'rejected' | 'pin_generated' | 'activated'
performed_by (UUID) - FK to users
performed_at (TIMESTAMPTZ)
details (JSONB)
```

---

## 🚀 FRONTEND COMPONENTS (Already Updated)

✅ **AccessRequestForm.tsx** - Za nove korisnike koji traže pristup
✅ **PINVerificationForm.tsx** - Za unos PIN-a i login
✅ **AdminAccessRequestsPanel.tsx** - Za admin approval workflow
✅ **Auth.tsx** - Delegira na gornje komponente

---

## 📝 NEXT STEPS

1. ✅ Kreiraj new tabele sa SQL migracijom
2. ✅ Aktualizirao sve komponente na frontendu
3. ⏳ Test sve scenarije (3 scenarija gore)
4. ⏳ Ako ima grešaka, prikaži console error
5. ⏳ Ažuriraj Admin.tsx da koristi `users` tabelu umjesto `divers`
6. ⏳ Izbriši staru `divers` tabelu (ili je ostavi za arhivu)

---

## ⚠️ IMPORTANT NOTES

- **Existing data** su migrirani u `users` tabelu
- **Admin users** (mulalic71@gmail.com, etc.) su automatski postavljeni na `role='admin'` i `status='active'`
- **Rejection workflow**: Kada se korisnik odbije, njegov `status` se postavlja na `rejected`, ali podaci ostaju u bazi
- **PIN generation**: Automatski generira unike 6-digitni PIN
- **Audit logging**: Sve akcije se bilježe u `access_requests_audit` tabeli
