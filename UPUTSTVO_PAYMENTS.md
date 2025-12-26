# 💰 IMPORT UPLATA - UPUTSTVO

## 📋 **PREGLED UPLATA:**

### **Pojedinačna uplata (18 osoba):**
- **Agenciji (SJJ)**: **925 €** (1,810 KM)
- **Adnanu (Gotovina)**: **915 €**
- **UKUPNO po osobi**: **1,840 €**

### **UKUPNI IZNOSI ZA GRUPU:**
```
Agencija (18 x 925€):  16,650 €
Adnan (18 x 915€):     16,470 €
─────────────────────────────
UKUPNO ZA GRUPU:       33,120 €
```

*(Napomena: Davor Mulalić je oslobođen plaćanja kao organizator)*

---

## 🚀 **KAKO IMPORTOVATI UPLATE:**

### **KORAK 1: Pokrenite IMPORT_PAYMENTS.sql**
1. Otvorite **Supabase → SQL Editor**
2. Kopirajte cijeli sadržaj fajla **`IMPORT_PAYMENTS.sql`**
3. Zalijepite u SQL Editor
4. Kliknite **RUN**

### **KORAK 2: Verifikujte Import**
Nakon pokretanja, trebali biste vidjeti:
```
✅ 19 payments inserted
✅ Total payments: 27,440 €
```

---

## 💳 **STRUKTURA UPLATE:**

Svaka uplata sadrži:
- ✅ `diver_id` - Povezano sa users tabelom
- ✅ `diver_name` - Ime ronilca
- ✅ `paid_to_agency` - Uplata agenciji (925 €)
- ✅ `paid_to_adnana` - Uplata Adnanu (915 €)
- ✅ `add_for_kids` - Dodatak za djecu (150 € ili 0 €)
- ✅ `amount_eur` - Ukupan iznos
- ✅ `payment_date` - Datum uplate (20.12.2025)
- ✅ `payment_purpose` - Svrha (Predračun br. 916/12-25)
- ✅ `payment_method` - Način (mixed/cash/complimentary)
- ✅ `status` - Status (completed)
- ✅ `note` - Napomena

---

## 👥 **VRSTE UPLATA:**

### **1. STANDARDNA UPLATA (15 osoba):**
```
Agencija:  925 €
Adnanu:    915 €
Ukupno:  1,840 €
```
**Ronilci:**
- Zahida Ademovic
- Omer Merzic
- Naida Haracic
- Emir Haracic
- Muammer Mrahorovic
- Midhat Kozadra
- Anida Bejdjakic
- Dora Kisic
- Elmedina Maljevic Suljic
- Adnan Drnda
- Samir Solakovic
- Nermin Skula
- NeXo
- Adisa Kozadra

### **2. BESPLATNO (1 osoba):**
```
Agencija:    0 €
Adnanu:      0 €
Ukupno:      0 €
```
**Ronilac:**
- Davor Mulalić (organizator)

### **3. DJECA (4 osobe):**
```
Agencija:    0 €
Adnanu:      0 €
Za djecu:  150 €
Ukupno:    150 €
```
**Djeca:**
- Dijete 1
- Dijete 2
- Dijete 3
- Dijete 4

---

## 📊 **PROVJERA U APLIKACIJI:**

Nakon importa:
1. **Ulogujte se** (PIN: 123456)
2. **Admin Panel → Finance Tab**
3. Trebali biste vidjeti:
   - ✅ **Total Collected: 27,440 €**
   - ✅ **Agency (SJJ): 13,475 €**
   - ✅ **Cash (MLE): 13,965 €** (13,365 + 600)
   - ✅ **19 payments** u listi

---

## 🔍 **SQL STATISTIKA:**

Skripta automatski prikazuje statistiku:
```sql
Total Agency:    13,475.00 €
Total Adnana:    13,365.00 €
Total Kids:         600.00 €
Grand Total:     27,440.00 €
Total Payments:          19
```

---

## ⚠️ **NAPOMENE:**

### **Datum uplate:**
- Sve uplate su datirane: **20.12.2025**
- Ako treba drugačiji datum, promijenite u SQL skripti

### **Svrha uplate:**
- Svi imaju istu svrhu: **"Predračun br. 916/12-25"**

### **Dodatna napomena:**
- Samo Zahida Ademovic ima napomenu: *"Dodatne informacije o popustima ili ratama."*

---

## ✅ **SLEDEĆI KORACI:**

1. **Pokrenite `IMPORT_PAYMENTS.sql`** u Supabase
2. **Pokrenite `IMPORT_RONIOCI.sql`** (ako niste već)
3. **Osvježite aplikaciju**
4. **Provjerite Finance tab** u Admin panelu

---

## 🎯 **FINALNI REZULTAT:**

Nakon oba importa imaćete:
- ✅ **19 ronioca** sa kompletnim podacima
- ✅ **19 uplata** sa detaljima
- ✅ **Kompletnu finansijsku statistiku**
- ✅ **Funkcionalan Admin panel**

**GOTOVO!** 🎉
