# 🏊‍♂️ IMPORT RONIOCA U SUPABASE - UPUTSTVO

## 📋 **ŠTA JE URAĐENO:**

### **Problem:**
- "Add Diver" forma ima samo **ime i email**
- Nedostaje **15+ polja** (telefon, adresa, datum rođenja, broj urona, itd.)
- Početna lista od **19 ronioca** treba da se importuje u Supabase

### **Rješenje:**

Napravio sam **SQL skriptu** koja:
1. ✅ Dodaje **sva nedostajuća polja** u `users` tabelu
2. ✅ Importuje **sve ronioce** sa kompletnim podacima
3. ✅ Dodeljuje **PIN kodove** svakom roniocu za login
4. ✅ Automatski označava **SSI instruktore** kao admins

---

## 🚀 **KAKO IMPORTOVATI RONIOCE:**

### **KORAK 1: Otvorite Supabase**
1. Idite na [https://supabase.com](https://supabase.com)
2. Otvorite svoj projekt
3. Kliknite **SQL Editor** u lijevom meniju

### **KORAK 2: Pokrenite SQL Skriptu**
1. Otvorite fajl: `IMPORT_RONIOCI.sql`
2. Kopirajte **cijeli sadržaj**
3. Zalijepite u Supabase SQL Editor
4. Kliknite **RUN** (zeleno dugme)

### **KORAK 3: Verifikujte Import**
Nakon pokretanja, trebali biste vidjeti:
```
✅ 19 rows affected
✅ All fields added successfully
```

---

## 👥 **IMPORTOVANI RONILCI:**

### **Instruktori (Admin role):**
1. **Muammer Mrahorovic** - PIN: 555555
2. **Midhat Kozadra** - PIN: 666666
3. **Davor Mulalić** - PIN: 123456 (već postojao)
4. **Adnan Drnda** - PIN: 999999
5. **Samir Solaković** - PIN: 121212
6. **Nermin Skula** - PIN: 131313

### **Članovi (Member role):**
1. **Zahida Ademovic** - PIN: 111111
2. **Omer Merzic** - PIN: 222222
3. **Naida Haracic** - PIN: 333333
4. **Emir Haracic** - PIN: 444444
5. **Anida Bejdjakic** - PIN: 777777
6. **Dora Kisic** - PIN: 888888
7. **Elmedina Maljevic Suljic** - PIN: 101010

### **Ostali:**
8. **NeXo** - PIN: 141414
9. **Adisa Kozadra** - PIN: 151515
10. **Dijete 1** - PIN: 161616
11. **Dijete 2** - PIN: 171717
12. **Dijete 3** - PIN: 181818
13. **Dijete 4** - PIN: 191919

---

## 📊 **DODANA POLJA U TABELU:**

Skripta dodaje ova polja u `public.users`:
- ✅ `phone` - Telefon
- ✅ `address` - Adresa
- ✅ `city` - Grad
- ✅ `country` - Država
- ✅ `birth_date` - Datum rođenja
- ✅ `age` - Godina
- ✅ `total_dives` - Ukupno urona
- ✅ `start_year` - Godina početka ronjenja
- ✅ `master_id` - SSI Master ID
- ✅ `ssi_pro_id` - SSI Pro ID (samo za instruktore)
- ✅ `photo_url` - Link ka slici
- ✅ `dietary_restriction` - Prehrambena ograničenja
- ✅ `emergency_contact_name` - Ime kontakta za hitne slučajeve
- ✅ `emergency_contact_relationship` - Veza (Spouse, itd.)
- ✅ `emergency_contact_phone` - Telefon kontakta

---

## 🔐 **TEST LOGINA:**

Nakon importa, možete se ulogovati sa bilo kojim PIN kodom:
```
Davor: 123456 (Admin)
Adnan: 999999 (Admin)
Midhat: 666666 (Admin)
Zahida: 111111 (Member)
Omer: 222222 (Member)
... itd.
```

---

## ✅ **PROVJERA:**

Nakon importa, u Admin panelu → Manifest tab trebali biste vidjeti:
- ✅ **19 ronioca** u listi
- ✅ **Svi podaci** prikazani (telefon, broj urona, itd.)
- ✅ **Slike** sa SSI profila
- ✅ **Instruktori** označeni kao Admin

---

## 📝 **NAPOMENA O "ADD DIVER" FORMI:**

Trenutna forma je jednostavna jer je dizajnirana za **brzo dodavanje**.  
Za **kompletan import**, koristite:
1. **SQL skriptu** (za prvi import) ✅
2. **CSV import** (za buduće importove) - može se dodati kasnije
3. **Ručno uređivanje** u Supabase Tables view

---

## 🎯 **SLEDEĆI KORACI:**

1. **Pokrenite SQL skriptu** u Supabase
2. **Osvježite aplikaciju** (Ctrl+F5)
3. **Ulogujte se** sa bilo kojim PIN kodom
4. **Provjerite Manifest tab** - svi ronilci trebaju biti tu!

---

## 🔧 **AKO IMA PROBLEMA:**

Ako SQL skripta ne radi, provjerite:
1. Da li ste koristili **Supabase SQL Editor** (ne Query Builder)
2. Da li postoji email konflikt (skripta automatski rješava duplikate)
3. Provjerite Console za greške

---

## ✅ **GOTOVO!**

Nakon pokretanja SQL skripte, imaćete **svih 19 ronioca** sa **svim podacima** u bazi! 🎉
