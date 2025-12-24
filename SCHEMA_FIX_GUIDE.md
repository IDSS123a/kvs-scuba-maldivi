# Supabase Schema Deployment Guide

## Status: READY FOR DEPLOYMENT ✅

**Updated:** 2025-12-22  
**Database:** PostgreSQL via Supabase  
**Schema Version:** Fresh with 19 expedition participants  
**Status:** All 19 divers migrated with real data from DiveSite  

## What's Included

### Tables Created (4 total)
- ✅ **divers** (19 participants - ready to deploy)
- ✅ **payments** (expedition fees tracking)
- ✅ **gallery** (trip photos with categories)
- ✅ **itinerary** (schedule + dive sites for 12 days)

### Participants Ready (19 total)
**Confirmed Adults (12):**
1. Zahida Ademovic (56, 115 dives) - zaadbos@gmail.com
2. Omer Merzic (28, 45 dives) - omer.merzic@gmail.com
3. Naida Haracic (44, 32 dives) - naida@sportsport.ba
4. Emir Haracic (46, 42 dives) - emir@sportsport.ba
5. Muammer Mrahorovic (50, 266 dives, **PRO**) - muammerm@gmail.com
6. Midhat Kozadra (48, 332 dives, **PRO**) - mido.kozadra@gmail.com
7. Anida Bejdjakic (37, 43 dives) - b.anida@hotmail.com
8. Dora Kisic (26, 69 dives) - dorakisic7@gmail.com
9. Elmedina Maljevic Suljic (47, 155 dives) - m.elmedina@hotmail.com
10. **Davor Mulalic** (54, 1030 dives, **PRO**, **ADMIN**) - mulalic71@gmail.com
11. **Adnan Drnda** (55, 1267 dives, **PRO**, **ADMIN**) - adnandrnda@hotmail.com
12. **Samir Solakovic** (58, 1007 dives, **PRO**, **ADMIN**) - samirso@hotmail.com

**Professional Dive Master (1):**
13. Nermin Skula (47, 225 dives, **PRO**) - skulary@hotmail.com

**Pending Participants (5):**
14. NeXo (pending) - 38761324599
15. Adisa Kozadra (pending) - 38761303426
16-19. Dijete 1-4 (children placeholders)

### Features Implemented
- ✅ RLS policies (public read, authenticated sensitive)
- ✅ Auto-timestamp triggers (created_at, updated_at)
- ✅ ENUM types (diver_status, payment_status, payment_method, gallery_category)
- ✅ Foreign key relationships (payments → divers)
- ✅ Database indexes (email, status, category, day)
- ✅ Sample itinerary (3 days ready)
- ✅ Emergency contact tracking (married participants linked)

## Deployment Steps (SIMPLE)

## Deployment Steps (SIMPLE)

### 1️⃣ Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/wgghitqmclpttslzffge/sql/new

### 2️⃣ Copy Migration File
Open [supabase_migration_fresh.sql](supabase_migration_fresh.sql):
- **Ctrl+A** to select all
- **Ctrl+C** to copy
- Paste entire content into SQL Editor

### 3️⃣ Run SQL
Click **Run** button in Supabase Editor

**Expected output:**
```
✅ DROP TABLE
✅ CREATE TYPE
✅ CREATE TABLE divers
✅ CREATE TABLE payments  
✅ CREATE TABLE gallery
✅ CREATE TABLE itinerary
✅ CREATE INDEX (7 indexes)
✅ CREATE TRIGGER (4 triggers)
✅ ALTER TABLE ... ENABLE RLS
✅ CREATE POLICY (5 policies)
✅ INSERT INTO itinerary (3 rows)
✅ INSERT INTO divers (19 rows)
```

### 4️⃣ Verify in Supabase
Go to **Table Editor**:
- ✅ Click "divers" → Should show 19 rows (IDs: 101-119)
- ✅ Click any diver (e.g., "Davor Mulalic") → Check photo_url and emergency_contact_name
- ✅ Click "itinerary" → Should show 3 days of schedule

### 5️⃣ Test in Your App
```bash
npm run dev
```

Then:
- Open http://localhost:3000 in browser
- Go to **Participants** tab → Should load all 19 divers with photos
- Go to **Admin** (PIN: 1919) → Should detect 3 admins (Davor, Adnan, Samir)
- Go to **Itinerary** → Should show 3 sample days

**Success Indicators:**
- Console shows: "Fetching divers from Supabase..." ✅
- All 19 photos load from divessi.com URLs ✅
- Participants page displays "Confirmed" status for 12 adults ✅
- Pro badges appear for 6 dive masters ✅

---

## Troubleshooting

### If SQL throws errors:

**Error: "syntax error at or near DROP"**
- Make sure you copied entire file (all 172 lines)
- Paste into brand new SQL tab

**Error: "duplicate key value violates unique constraint"**
- This means divers table already exists with same names
- The migration starts with `DROP TABLE IF EXISTS divers CASCADE` to prevent this
- If still failing: Drop divers table manually first:
  ```sql
  DROP TABLE IF EXISTS divers CASCADE;
  ```

**Error: "value too long for type character varying"**
- Photo URLs exceed field length
- Already fixed in fresh migration (uses TEXT type)

**Divers show in Table Editor but don't appear in app:**
- Make sure `.env.local` has `VITE_USE_SUPABASE=true`
- Check browser console for Supabase connection errors
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local

### If you need to clear everything:

```sql
-- Run this to completely reset
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS itinerary CASCADE;
DROP TABLE IF EXISTS divers CASCADE;
DROP TYPE IF EXISTS gallery_category;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS diver_status;
```

Then run the full migration file again.

---

## Notes

- **Auto-increment IDs:** Uses UUID (auto-generated), not numeric sequences
- **Timestamps:** created_at and updated_at auto-managed by database
- **Emergency Contacts:** Captured for married participants (6 total)
- **Photos:** Linked to divessi.com profile images (copy URLs in app)
- **Pro Status:** Marked 6 dive masters with 1000+ dives or SSI Pro card
- **Admin Detection:** App auto-recognizes Davor, Adnan, Samir as admins

### Error: "column does not exist"
- Code expecting column that doesn't exist
- **Fix:** Verify column names match exactly (case-sensitive)

---

## Verification Checklist

After running fresh migration:

- [ ] Table Editor shows 4 tables
- [ ] divers table has 16 columns
- [ ] itinerary table has 3 sample rows
- [ ] Can insert test row without errors
- [ ] App console shows "Fetching divers from Supabase..."
- [ ] No errors in browser console
- [ ] Can see participant list loading

---

## Import Data After Schema Fix

Once schema is clean, import Google Sheets data:

```typescript
// Use this in browser console or add to Admin panel
import { importDiversFromCSV } from './services/supabaseImport';

const csvText = `name,address,city,country,birthdate,email,phone,dives,master_id,ssi_pro,photo,dietary,em_name,em_rel,em_phone
Davor Mulalić,...`;

const result = await importDiversFromCSV(csvText);
console.log(result);
// { imported: 19, failed: 0, errors: [] }
```

---

## Next Steps

1. **Run fresh migration:** [supabase_migration_fresh.sql](../supabase_migration_fresh.sql)
2. **Verify tables:** Check Table Editor in Supabase
3. **Test insert:** Run test query above
4. **Check app:** Should load from Supabase now
5. **Import data:** Use supabaseImport functions

---

**Need help?** Check:
- [PHASE2_SUPABASE_GUIDE.md](PHASE2_SUPABASE_GUIDE.md) - Full deployment guide
- [supabaseService.ts](../services/supabaseService.ts) - Service functions
- Supabase Logs: https://supabase.com/dashboard/project/wgghitqmclpttslzffge/logs/edge-logs
