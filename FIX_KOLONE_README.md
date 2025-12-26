# ⚠️ FIX ZA GREŠKE - DODAVANJE KOLONA

## 🔧 **AKO DOBIJETE GREŠKE O NEDOSTAJUĆIM KOLONAMA:**

### **Greške koje možete dobiti:**
```
ERROR: column "diver_id" does not exist
ERROR: column "amount_eur" does not exist
ERROR: column "payment_method" does not exist
```

---

## ✅ **RJEŠENJE:**

**Pokrenite `FIX_PAYMENTS_COLUMNS.sql` PRVO!**

Ova skripta dodaje **SVE potrebne kolone** u `payments` tabelu:

### **Kolone koje se dodaju:**
- ✅ `diver_id` - UUID foreign key prema users
- ✅ `diver_name` - Ime ronilca (text)
- ✅ `paid_to_agency` - Uplata agenciji (decimal)
- ✅ `paid_to_adnana` - Uplata Adnanu (decimal)
- ✅ `add_for_kids` - Dodatak za djecu (decimal)
- ✅ `amount_eur` - Ukupan iznos (decimal)
- ✅ `payment_method` - Način uplate (text)
- ✅ `status` - Status uplate (text)
- ✅ `payment_date` - Datum uplate (date)
- ✅ `payment_purpose` - Svrha uplate (text)
- ✅ `note` - Napomena (text)
- ✅ `created_at` - Datum kreiranja (timestamp)
- ✅ `updated_at` - Datum ažuriranja (timestamp)

---

## 🚀 **REDOSLIJED POKRETANJA:**

### **KORAK 1: Dodaj kolone**
```sql
-- Pokrenite: FIX_PAYMENTS_COLUMNS.sql
```
Ovo dodaje sve potrebne kolone bez dodavanja podataka.

### **KORAK 2: Verifikuj kolone**
Nakon pokretanja, skripta automatski prikazuje sve kolone:
```
column_name         | data_type
--------------------+-------------------
diver_id           | uuid
diver_name         | text
paid_to_agency     | numeric
paid_to_adnana     | numeric
...
```

### **KORAK 3: Importuj podatke**
```sql
-- Pokrenite: IMPORT_PAYMENTS.sql
```
Sada treba da radi bez greške!

---

## 📝 **NAPOMENA:**

Ako već imate neke kolone, skripta ih **NEĆE duplicirati** jer koristi:
```sql
ADD COLUMN IF NOT EXISTS ...
```

To znači da je **SIGURNO** pokrenuti više puta.

---

## ✅ **POKUŠAJTE PONOVO:**

1. **Prvo**: `FIX_PAYMENTS_COLUMNS.sql`
2. **Drugo**: `IMPORT_PAYMENTS.sql`

**Trebalo bi da radi sada!** 🎉
