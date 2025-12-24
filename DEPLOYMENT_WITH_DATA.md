# Deploy Updated Schema with 19 Divers + Payment Data

## ✅ What's Included Now

### Divers (19 total)
**Adult Divers (12) - CONFIRMED:**
1. Zahida Ademovic - 115 dives - zaadbos@gmail.com
2. Omer Merzic - 45 dives - omer.merzic@gmail.com
3. Naida Haracic - 32 dives - naida@sportsport.ba
4. Emir Haracic - 42 dives - emir@sportsport.ba
5. Muammer Mrahorovic - 266 dives - **PRO** - muammerm@gmail.com
6. Midhat Kozadra - 332 dives - **PRO** - mido.kozadra@gmail.com
7. Anida Bejdjakic - 43 dives - b.anida@hotmail.com
8. Dora Kisic - 69 dives - dorakisic7@gmail.com
9. Elmedina Maljevic Suljic - 155 dives - m.elmedina@hotmail.com
10. **Davor Mulalic** - 1030 dives - **PRO** - ⭐ **ADMIN** - mulalic71@gmail.com
11. **Adnan Drnda** - 1267 dives - **PRO** - ⭐ **ADMIN** - adnandrnda@hotmail.com
12. **Samir Solakovic** - 1007 dives - **PRO** - ⭐ **ADMIN** - samirso@hotmail.com
13. Nermin Skula - 225 dives - **PRO** - skulary@hotmail.com

**Pending/Partial Data (5):**
- NeXo - pending
- Adisa Kozadra - pending
- Dijete 1-4 - children placeholders (4 total)

### Payment Data (41 payment records)
**From Finance Sheet - Predračun br. 916/12-25 (2025-12-20)**

**Confirmed Adults (12):**
Each has 2 payment records:
- 925 EUR to agency (payment_method: agency) - **COMPLETED**
- 915 EUR direct payment (payment_method: cash) - **COMPLETED**
- **Total per person: 1840 EUR**

**Pro Dive Master (1):**
- Nermin Skula: Same as above (925 + 915 EUR)

**Pending Members (2):**
- NeXo: 925 + 915 EUR (status: pending)
- Adisa Kozadra: 925 + 915 EUR (status: pending)

**Children (4):**
- Dijete 1-4: 150 EUR each for kids addition (payment_method: cash) - **PENDING**

**Admin Exception:**
- Davor Mulalic: 0 EUR (admin/organizer - no charge)

**Total Payments:** 
- 26 confirmed agency payments × 925 = 24,050 EUR
- 11 confirmed direct payments × 915 = 10,065 EUR
- 4 pending kids payments × 150 = 600 EUR
- **Grand Total: 34,715 EUR**

---

## 🚀 Single-Step Deployment (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/wgghitqmclpttslzffge/sql/new

### Step 2: Copy Full Migration
Open `supabase_migration_fresh.sql` in your editor:
- **Select All** (Ctrl+A)
- **Copy** (Ctrl+C)
- Paste into SQL Editor
- **Click Run**

**Expected success message:**
```
✅ Queries executed successfully
```

### Step 3: Verify in Supabase Table Editor
1. Go to **Table Editor** (left sidebar)
2. Check `divers` → Should show **19 rows** (IDs: 101-119)
3. Check `payments` → Should show **41 rows** (payment records)
4. Check `itinerary` → Should show **3 rows** (sample days)

Example verification for Davor Mulalic:
- Name: "Davor Mulalic"
- Email: "mulalic71@gmail.com"
- Total Dives: 1030
- is_pro: true
- status: "confirmed"
- Emergency Contact: "Amela Mulalić" (Spouse)

### Step 4: Test in App
```bash
npm run dev
```

Check browser at http://localhost:3000:
- **Participants Tab** → All 19 divers load with photos ✅
- **Admin Panel** (PIN: 1919) → Detects 3 admins (Davor, Adnan, Samir) ✅
- **Console** → Shows "Fetching divers from Supabase..." ✅

---

## 📊 Database Schema Summary

| Table | Rows | Purpose |
|-------|------|---------|
| `divers` | 19 | All expedition participants |
| `payments` | 41 | Payment tracking from Finance sheet |
| `gallery` | 0 | Trip photos (ready for upload) |
| `itinerary` | 3 | Expedition schedule (sample data) |

---

## 💳 Payment Summary

**Finance Sheet Data Integrated:**
- Source: Google Sheets "Finance" tab (Predračun br. 916/12-25)
- Date: 2025-12-20
- Total Records: 41 payment entries
- Total Amount: 34,715 EUR

**Payment Breakdown by Participant:**
- **12 confirmed adults:** 1840 EUR each (925 agency + 915 direct)
- **1 pro diver:** 1840 EUR (925 agency + 915 direct)
- **2 pending members:** 1840 EUR each (925 agency + 915 direct)
- **1 admin (Davor):** 0 EUR (organizer/no charge)
- **4 children:** 150 EUR each (kids addition)

**Payment Methods:**
- `agency`: Payments to agency/tour operator (925 EUR each)
- `cash`: Direct payments (915 EUR) + kids payments (150 EUR)

**Status:**
- Confirmed adults & Nermin: `completed`
- Pending members (NeXo, Adisa) & Children: `pending`

---

## 🔍 What Gets Pre-populated per Diver

- ✅ Full Name (unique)
- ✅ Email
- ✅ Phone
- ✅ Birth Date (format: DD.MM.YYYY)
- ✅ Age (calculated)
- ✅ Total Dives (dive experience count)
- ✅ Start Year (when started diving)
- ✅ SSI Pro Status (is_pro: true/false)
- ✅ Profile Photo URL (from divessi.com)
- ✅ Dietary Restrictions (if any - only Adnan has "No fish")
- ✅ Emergency Contact (name, relationship, phone for married divers)
- ✅ Status (confirmed/pending)

---

## ⭐ Admin Recognition

Three expedition leaders are auto-detected as admins via code:
```javascript
const AUTHORIZED_ADMINS = [
  'Davor Mulalic',
  'Adnan Drnda',
  'Samir Solakovic'
];
```

Also protected by PIN: **1919**

---

## ⏭️ Next Steps After Successful Deployment

### Immediate ✅
1. Verify all 19 divers display in app
2. Confirm 41 payment records in Supabase
3. Test admin panel access with PIN 1919

### Phase 3 (Coming Next)
- [ ] Gallery upload functionality with Supabase Storage
- [ ] Photo categorization (dive, group, meal, fun, other)
- [ ] Real-time photo updates

### Phase 4
- [ ] Preparation component (checklist, packing, docs)
- [ ] Payment status tracking dashboard
- [ ] Payment reminders for pending members

---

## 🐛 Troubleshooting

### SQL Error: "table divers already exists"
The migration file includes `DROP TABLE IF EXISTS...` at the top.
- If still failing: Ensure you ran step 2 first
- Manually drop in new SQL tab, then re-run migration

### "value too long for type character varying"
All string fields are set to TEXT type (unlimited).
- This shouldn't happen with the fresh migration
- If persists: Check if old table structure is still being used

### Divers table empty (0 rows)
- Verify the INSERT statement executed (look for error messages)
- Check that all 19 INSERT lines are in the file
- Re-run the migration

### App shows "Sheet loading..." instead of Supabase data
**Check `.env.local`:**
```
VITE_USE_SUPABASE=true
```

If it's missing or false:
1. Add it to `.env.local`
2. Restart dev server: `npm run dev`
3. Refresh browser

### Payment data not showing in Admin panel
- Verify `payments` table has 41 rows
- Reload app (Ctrl+R)
- Check browser DevTools → Network → look for supabaseService calls

---

## 📝 Referenced Files

- **Migration Script:** [supabase_migration_fresh.sql](supabase_migration_fresh.sql) - Complete with divers + payments
- **Services:** [services/supabaseService.ts](services/supabaseService.ts) - Data operations
- **Config:** [.env.local](.env.local) - Must have `VITE_USE_SUPABASE=true`
- **Schema Guide:** [SCHEMA_FIX_GUIDE.md](SCHEMA_FIX_GUIDE.md) - Detailed troubleshooting

---

## ✅ Deployment Checklist

Before running migration:
- [ ] Have you reviewed all 19 diver names?
- [ ] Finance data matches your expectations?
- [ ] Ready to drop old schema (all data will be deleted)?

After running migration:
- [ ] SQL Editor shows "Queries executed successfully" ✅
- [ ] Table Editor shows `divers` with 19 rows
- [ ] Table Editor shows `payments` with 41 rows
- [ ] `VITE_USE_SUPABASE=true` in `.env.local`
- [ ] `npm run dev` starts without errors
- [ ] Browser loads all 19 participants with photos
- [ ] Admin panel (PIN: 1919) recognizes 3 admins

---

## 🎉 Ready for Deployment!

Your complete KVS-SCUBA 2026 database is ready. All 19 divers + 41 payment records from Finance sheet are included.

**⏱️ Deployment time: ~2 minutes**

---

**⏱️ Total time: ~3-5 minutes**

Let me know once you've deployed and if everything loads correctly! 🚀
