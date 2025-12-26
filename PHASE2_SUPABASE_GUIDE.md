# KVS-SCUBA Maldives 2026 - Supabase Implementation Guide

## Phase 2: Database Deployment & Backend Integration

### Overview
This guide walks you through deploying the Supabase database schema and enabling Supabase as the data source for your KVS-SCUBA expedition management application.

**Current Status:**
- ✅ Supabase client configured
- ✅ Database schema prepared
- ✅ Supabase service functions created
- ✅ sheetsService refactored with feature flag
- ⏳ Database deployment pending

---

## Step 1: Deploy Database Schema

### 1.1 Access Supabase Console
1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Log in with your account
3. Select your project: **kvs-scuba-maldivi** (ID: wgghitqmclpttslzffge)

### 1.2 Create Tables via SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click **New Query**
3. **Copy the entire contents** of [supabase_migration.sql](../supabase_migration.sql)
4. **Paste** into the SQL Editor
5. Click **Run** (play button)
6. Confirm success - you should see 4 new tables:
   - `divers` (expedition participants)
   - `payments` (payment tracking)
   - `gallery` (photos and media)
   - `itinerary` (daily schedule)

### 1.3 Verify Table Creation
1. In the left sidebar, click **Table Editor**
2. You should see all 4 tables listed
3. Click each table to verify columns are correct:

**divers table:**
```
id, name, email, phone, birth_date, age, total_dives, 
start_year, is_pro, photo_url, dietary_restrictions, 
emergency_contact_name, emergency_contact_relationship, 
emergency_contact_phone, status, created_at, updated_at
```

**payments table:**
```
id, diver_id, amount_eur, payment_method, payment_date, 
status, notes, created_at, updated_at
```

**gallery table:**
```
id, diver_id, title, description, image_url, category, 
uploaded_by, created_at, updated_at
```

**itinerary table:**
```
id, day, date, title, description, type, location, 
details, created_at, updated_at
```

---

## Step 2: Populate Divers Data from Google Sheets

### 2.1 Export Data from Google Sheets
1. Open the expedition manifest: [Google Sheets Link](https://docs.google.com/spreadsheets/d/15ObuXKzrLeZFlIFUvWpTd6g4cfBL4FHxTp_jHr38Ee8/edit?usp=sharing)
2. Select **File → Download → CSV**
3. Save as `divers.csv`

### 2.2 Parse and Import Data
Option A: **Manual Import via Supabase UI** (Easiest)
1. In Supabase, go to **Table Editor → divers**
2. Click **Insert row**
3. Manually enter participant data from the CSV

Option B: **Programmatic Import** (Recommended for bulk data)
1. Use the import function below in your application context:
```typescript
import { supabase } from './services/supabaseClient';

async function importDiversFromCSV(csvFile: File) {
  const text = await csvFile.text();
  const lines = text.split('\n').slice(1); // Skip header
  
  for (const line of lines) {
    const [name, address, city, country, birthInfo, email, phone, diveInfo, masterId, ssiPro, photo, dietary, emName, emRel, emPhone] = line.split(',');
    
    const ageMatch = birthInfo?.match(/\((\d+)\)/);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;
    
    const diveMatch = diveInfo?.match(/^(\d+)/);
    const dives = diveMatch ? parseInt(diveMatch[1]) : 0;
    
    await supabase.from('divers').insert({
      name: name?.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      birth_date: birthInfo?.split('(')[0].trim() || null,
      age,
      total_dives: dives,
      is_pro: !!ssiPro?.trim(),
      photo_url: photo?.trim() || null,
      dietary_restrictions: dietary?.trim() || null,
      emergency_contact_name: emName?.trim() || null,
      emergency_contact_relationship: emRel?.trim() || null,
      emergency_contact_phone: emPhone?.trim() || null,
      status: 'confirmed',
    });
  }
}
```

---

## Step 3: Enable Supabase Mode in Application

### 3.1 Update .env.local
Add the feature flag to enable Supabase:
```dotenv
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_SUPABASE_URL=https://wgghitqmclpttslzffge.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZ2hpdHFtY2xwdHRzbHpmZmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODQyODAsImV4cCI6MjA4MTk2MDI4MH0.xCrfueinWPNtElzeOcpyx7d9erALdLC7Cd4bRTyYlGg
VITE_FIXER_API_KEY=your-fixer-api-key
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key
VITE_USE_SUPABASE=true
```

### 3.2 Restart Development Server
```bash
npm run dev
```

The application will now:
1. Check for `VITE_USE_SUPABASE=true`
2. Fetch participant data from Supabase instead of Google Sheets
3. Fall back to Google Sheets if Supabase is unavailable

---

## Step 4: Configure Row Level Security (RLS)

The database schema already includes basic RLS policies. For production, you should:

### 4.1 Update RLS Policies
1. In Supabase, go to **Authentication → Policies**
2. Review and adjust policies for your use case:

**Current Policies:**
- `divers_public_read`: Anyone can read diver data
- `payments_authenticated_read`: Only authenticated users can see payments
- `payments_authenticated_insert`: Only authenticated users can record payments
- `gallery_public_read`: Anyone can view gallery images

### 4.2 (Optional) Set up Supabase Auth
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates for sign-up/reset

---

## Step 5: Set Up Real-Time Subscriptions (Optional)

The application includes functions for real-time updates:

```typescript
import { subscribeToDivers, subscribeToPayments, subscribeToGallery } from './services/supabaseService';

// Listen for diver changes
const subscription = subscribeToDivers((diver) => {
  console.log('Diver updated:', diver);
  // Update UI
});

// Unsubscribe when done
subscription.unsubscribe();
```

These are already integrated in components but disabled by default.

---

## Available Supabase Service Functions

All functions are in [services/supabaseService.ts](../services/supabaseService.ts):

### Data Fetching
- `fetchDiversFromSupabase()` - Get all expedition participants
- `fetchPayments()` - Get all payments
- `fetchGalleryImages(category?)` - Get photos
- `fetchItinerary()` - Get daily schedule

### Data Modification
- `upsertDiver(diver)` - Create or update participant
- `recordPayment(...)` - Log a payment
- `uploadGalleryImage(...)` - Add photo to gallery

### Real-Time Subscriptions
- `subscribeToDivers(callback)` - Listen to diver changes
- `subscribeToPayments(callback)` - Listen to payment changes
- `subscribeToGallery(callback)` - Listen to gallery changes

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `npm install`

### Issue: "Supabase credentials not found"
**Solution:** Verify `.env.local` has:
```
VITE_SUPABASE_URL=https://wgghitqmclpttslzffge.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Issue: "RLS violation" error
**Solution:** Check Supabase RLS policies in **Authentication → Policies**. Ensure the current user matches the policy conditions.

### Issue: Data not updating in real-time
**Solution:** Verify Realtime is enabled:
1. In Supabase, go to **Database → Replication**
2. Enable replication for tables you want to watch

### Issue: TypeScript errors with import.meta.env
**Solution:** Ensure [vite-env.d.ts](../vite-env.d.ts) exists and is imported in tsconfig.json

---

## Next Steps

After successful deployment:

1. **Phase 2 Complete:** ✅ Database deployed
2. **Phase 3:** Complete Gallery upload functionality
3. **Phase 4:** Integrate Free APIs (Fixer.io, OpenSeaMap, Countries API)
4. **Phase 5:** Implement Preparation component

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Project Settings:** https://app.supabase.com/project/wgghitqmclpttslzffge
- **Database Schema:** [supabase_migration.sql](../supabase_migration.sql)
- **Service Functions:** [supabaseService.ts](../services/supabaseService.ts)

---

**Status:** Phase 2 Implementation in Progress  
**Last Updated:** December 22, 2025  
**Next Review:** After database deployment
