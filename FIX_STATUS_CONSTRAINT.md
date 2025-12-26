# ⚠️ FIX: STATUS CHECK CONSTRAINT GREŠKA

## 🔴 **GREŠKA:**
```
ERROR: 23514: new row violates check constraint "payments_status_check"
```

## 🔍 **UZROK:**
Tabela `payments` ima CHECK constraint koji ograničava dozvoljene vrednosti za `status` kolonu.  
Vaša skripta pokušava da ubaci `'completed'`, ali constraint to ne dozvoljava.

---

## ✅ **RJEŠENJE:**

### **ŠTA SAM URADIO:**

1. **Uklonio stari constraint:**
```sql
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
```

2. **Dodao novi constraint sa SVIM vrednostima:**
```sql
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'completed', 'paid', 'partial', 'cancelled', 'refunded'));
```

---

## 📋 **DOZVOLJENE STATUS VREDNOSTI:**

Nova skripta podržava:
- ✅ `'pending'` - Na čekanju
- ✅ `'completed'` - Završeno (koristimo ovo)
- ✅ `'paid'` - Plaćeno
- ✅ `'partial'` - Delimično plaćeno
- ✅ `'cancelled'` - Otkazano
- ✅ `'refunded'` - Vraćeno

---

## 🚀 **KAKO POKRENUTI:**

### **SADA POKRENITE AŽURIRANI `IMPORT_PAYMENTS.sql`**

Skripta sada:
1. ✅ Uklanja stari constraint
2. ✅ Dodaje sve kolone
3. ✅ Kreira novi constraint sa `'completed'`
4. ✅ Importuje sve uplate

**Trebalo bi da radi bez greške!** 🎉

---

## 📝 **NAPOMENA:**

Ako još uvijek dobijete grešku, pokrenite fajlove **OVIM REDOM:**

1. **`FIX_PAYMENTS_COLUMNS.sql`** - Priprema tabelu
2. **`IMPORT_PAYMENTS.sql`** - Importuje podatke

---

## ✅ **GOTOVO!**

Constraint je sada fleksibilan i dozvoljava sve potrebne vrednosti.
