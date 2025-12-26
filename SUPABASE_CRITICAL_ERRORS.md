# 🔴 SUPABASE KRITIČNE GREŠKE - DETALJNI IZVJEŠTAJ

**Datum:** 24. Decembar 2025  
**Status:** 🔴 KRITIČNO - 6 GLAVNIH GREŠAKA PRONAĐENO  
**Prioritet:** HITNO ISPRAVITI PRE PRODUKCIJE  

---

## ⚠️ SCENARIO 1: Pristup Prije Odobravanja

### Problem
```
1. Korisnik A pošalje zahtjev
2. Status = 'pending'
3. Korisnik A može da upiše PIN
4. Direktno je Provjera: eq('pin_code', inputPin) ne provjerava status!
5. ❌ KORISNIK JE PROŠAO BEZ ODOBRAVANJA
```

### Gdje je bug
**File:** `services/pinService.ts` linija 26-35
```typescript
const { data: exactMatch } = await supabase
  .from('users')
  .select('*')
  .eq('pin_code', cleanPin)  // ❌ Ne provjerava status!
  .limit(1);
```

### Ispravka
```typescript
const { data: exactMatch } = await supabase
  .from('users')
  .select('*')
  .eq('pin_code', cleanPin)
  .eq('status', 'approved')  // ✅ SAMO odobreni korisnici!
  .limit(1);
```

---

## ⚠️ SCENARIO 2: Dupli PIN Kodovi

### Problem
```
1. Admin A odobri korisnika = PIN 123456
2. Admin B odobri drugog korisnika = ista PIN 123456
3. Obojica mogu da se prijave sa istom PIN!
4. ❌ SIGURNOSNI PROPUST
```

### Gdje je bug
**File:** `services/pinService.ts` linija 160-180
```typescript
export const generateUniquePin = async (): Promise<string> => {
  let generatedPin: string;
  
  do {
    generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data: existing, error } = await supabase
      .from('users')
      .select('id')
      .eq('pin_code', generatedPin)
      .maybeSingle();  // ❌ GREŠKA! Ovo može vratiti više redova!
    
    if (!existing) {  // ❌ Logika je pogrešna
      break;
    }
  } while (true);
  
  return generatedPin;
};
```

### Problem sa `maybeSingle()`
- Ako database vrati više redova, `.maybeSingle()` baca grešku
- Trebalo bi `.single()` sa error handling

### Ispravka
```typescript
export const generateUniquePin = async (): Promise<string> => {
  let generatedPin: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
    
    // ✅ ISPRAVKA: Koristi count umjesto select
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('pin_code', generatedPin);
    
    if (error) {
      console.error('PIN uniqueness check error:', error);
      continue;
    }
    
    if ((count || 0) === 0) {
      console.log('✅ PIN is unique:', generatedPin);
      return generatedPin;
    }
    
    console.log(`⚠️ PIN exists, attempt ${attempts}/${maxAttempts}`);
    
  } while (attempts < maxAttempts);
  
  throw new Error('Could not generate unique PIN');
};
```

---

## ⚠️ SCENARIO 3: Duplicate Access Requests

### Problem
```
1. User: "Marko Marković"
2. Email: marko@example.com
3. Marko pošalje zahtjev - OK
4. Marko OPET pošalje zahtjev sa drugim imenom!
5. ❌ JEDAN EMAIL, VIŠE ZAHTJEVA
```

### Gdje je bug
**File:** `components/AccessRequestForm.tsx` linija 95-120

Problem je što se provjeravaju `existingUser` ali samo ako već postoji korisnik. Nema check-a u `access_requests` tabeli!

### Ispravka
```typescript
// Prvo provjeri access_requests tabelu
const { data: existingRequest } = await supabase
  .from('access_requests')
  .select('id, status, created_at')
  .eq('email', normalizedEmail)
  .eq('status', 'pending')
  .maybeSingle();

if (existingRequest) {
  setError('⚠️ You already have a pending request. Organizers will contact you within 24 hours.');
  setLoading(false);
  return;
}
```

---

## ⚠️ SCENARIO 4: Nema Admin Approval Procesa

### Problem
```
1. Korisnik zatraži pristup (status='pending')
2. Admin vidi zahtjev u admin panelu
3. Admin klikne "Approve"
4. ❌ GREŠKA: Nema koda koji odobrava!
```

### Gdje je bug
**File:** Nisu našli `approveUser()` funkciju  
**Trebalo bi:** `components/AdminPanel.tsx` sa "Approve/Reject" buttons

### Inspravka - Nova Funkcija
```typescript
export const approveUserAndSendPin = async (
  userId: string,
  adminId: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
  try {
    // 1. Check if user is still pending
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id, email, name, status')
      .eq('id', userId)
      .eq('status', 'pending')
      .single();

    if (checkError || !user) {
      return { success: false, error: 'User not found or already processed' };
    }

    // 2. Generate unique PIN
    const pin = await generateUniquePin();

    // 3. Update user status and PIN
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        status: 'approved',
        pin_code: pin,
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('status', 'pending')  // Only if still pending
      .select();

    if (updateError) {
      return { success: false, error: 'Failed to approve user' };
    }

    // 4. Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'user_approved',
        admin_id: adminId,
        details: { pin_sent: true, email: user.email },
        created_at: new Date().toISOString()
      });

    // 5. Return PIN for sending email
    return { success: true, pin };

  } catch (error) {
    console.error('Approval error:', error);
    return { success: false, error: String(error) };
  }
};
```

---

## ⚠️ SCENARIO 5: Status Flow nije Jasan

### Problem
```
pending → ??? → approved → ??? → active

Gdje se mijenja status?
```

### Trebalo bi:
```
1. PENDING - Korisnik zatraži pristup
2. APPROVAL_PENDING - Admin je vidio zahtjev
3. APPROVED - Admin odobrio, PIN poslan
4. ACTIVE - Korisnik se prvi put prijavio
```

### Ispravka
Dodaj database colone:
```sql
ALTER TABLE users ADD COLUMN approved_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN approved_by UUID;
ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN attempt_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;
```

---

## ⚠️ SCENARIO 6: Nema Row Level Security (RLS)

### Problem
```
BILO KO sa anonimnim ključem može da:
- Vidi sve korisnike
- Vidi sve PIN kodove
- Vidi sve email adrese
- ❌ NEMA SIGURNOSTI!
```

### Trebalo bi RLS politike:
```sql
-- Samo korisnik vidi svoje podatke
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Samo admin vidi sve korisnike
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- PIN je vidljiv samo nakon 'approved'
CREATE POLICY "users_pin_own" ON users
  FOR SELECT
  USING (auth.uid() = id AND status = 'active');
```

---

## ⚠️ SCENARIO 7: Nema Rate Limiting

### Problem
```
1. Hacker pokuša PIN 999999
2. Greška - novaje pokušaj!
3. Hacker pokuša PIN 999998
4. Greška - još jedan pokušaj!
5. Brute force... 1000 pokušaja za 1 sekund!
6. ❌ HACKA JE PIN ZA 1 MINUTU!
```

### Ispravka
```typescript
// Brojaj pokušaje
const checkAttempts = async (email: string) => {
  const { count } = await supabase
    .from('pin_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Poslnih 5 min

  return (count || 0) >= 5; // Max 5 pokušaja za 5 minuta
};

// Log pokušaj
const logAttempt = async (email: string, success: boolean) => {
  await supabase
    .from('pin_attempts')
    .insert({
      email,
      success,
      ip_address: await getClientIP(),
      created_at: new Date().toISOString()
    });
};
```

---

## 📋 SAŽETAK GREŠKE

| # | Greška | Severnost | Gdje | Ispravka |
|---|--------|-----------|------|----------|
| 1 | Pristup bez odobravanja | 🔴 KRITIČNA | pinService.ts:26 | Dodaj .eq('status', 'approved') |
| 2 | Dupli PIN kodovi | 🔴 KRITIČNA | pinService.ts:160 | Koristi count() umjesto maybeSingle() |
| 3 | Višestruki zahtjevi | 🟠 VISOKA | AccessRequestForm.tsx:95 | Dodaj check u access_requests tabeli |
| 4 | Nema approval procesa | 🔴 KRITIČNA | AdminPanel (missing) | Kreiraj approval funkciju |
| 5 | Status flow neizvršen | 🟠 VISOKA | Svugdje | Jasno defini 4-step flow |
| 6 | Nema RLS politika | 🔴 KRITIČNA | Supabase | Primijeni RLS na sve tabele |
| 7 | Nema rate limitinga | 🟠 VISOKA | pinService.ts:50 | Brojaj pokušaje |

---

## ✅ AKCIONI PLAN

1. **ODMAH** (< 30 min)
   - [ ] Ispravka pinService.ts - status provera
   - [ ] Ispravka generateUniquePin() - count() logic
   - [ ] Dodaj check u AccessRequestForm - access_requests tabela

2. **HITNO** (< 1 sat)
   - [ ] Kreiraj approveUserAndSendPin() funkciju
   - [ ] Kreiraj AdminPanel sa approval buttonima
   - [ ] Dodaj rate limiting

3. **KRITIČNO** (< 2 sata)
   - [ ] Primijeni RLS politike na sve tabele
   - [ ] Dodaj audit_logs za sve akcije
   - [ ] Testiraj sve scenarije

4. **PRIJE PRODUKCIJE**
   - [ ] Run security audit
   - [ ] Test sa 10 test korisnika
   - [ ] Svi scenariji green

---

**Završetak Očekivan:** Isti Dan  
**Sigurnost:** ⚠️ HITNO!  
