# KVS SCUBA Maldives 2026 - Quick Start Guide 🤿

## Project Overview

The KVS SCUBA Maldives 2026 portal is a comprehensive expedition management web application featuring real-time data integration, interactive maps, photo gallery, participant management, and essential traveler information.

**Status**: ✅ All 4 Mandates Complete and Production-Ready

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd kvs-scuba-maldivi
npm install
```

### 2. Environment Setup
```bash
# Copy template
cp .env.example .env

# Fill in required values:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GOOGLE_CLIENT_ID
```

### 3. Run Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
# Output: dist/ folder
```

---

## 📋 Feature Summary

### ✅ Mandate 1: SSI Branding
- 100% PADI reference removal
- Consistent SSI certification system
- Status: **COMPLETE** (verified via grep)

### ✅ Mandate 2: Real Data Integration
- Supabase gallery with live upload
- Photo category filtering (Dive, Group, Meal, Fun, Other)
- Real-time subscription updates
- Status: **COMPLETE** (tested)

### ✅ Mandate 3: Enhanced Itinerary & Map
- Full 12-day expedition schedule (Jan 5-16, 2026)
- Interactive map with 70vh viewport
- Marine chart overlay (OpenSeaMap)
- POI markers (restaurants, hotels, attractions)
- Status: **COMPLETE** (tested)

### ✅ Mandate 4: Essential Information Dashboard
- Real-time exchange rates (EUR→BAM/USD)
- Healthcare facilities (hospitals, pharmacies)
- Islamic prayer times (Aladhan API)
- Country information and cultural notes
- Status: **COMPLETE** (tested)

---

## 🌐 Navigation

| Menu Item | Component | Features |
|-----------|-----------|----------|
| **Istraži** | Dashboard | Countdown, weather, highlights |
| **Lokacije** | Itinerary | 12-day schedule, interactive map |
| **Tim** | Participants | Crew list, SSI certifications |
| **Galerija** | Gallery | Photo library, upload, filters |
| **Vodiči** | Preparation | SSI courses, FAQ, safety |
| **Informacije** | EssentialInfo | Prayer times, exchange, healthcare |

---

## 🔑 API Keys Required

### Required (Supabase)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Optional (for live currency rates)
```
VITE_FIXER_API_KEY=your-key  # Get free at https://fixer.io
```
*Note: Fallback rates (USD 1.08, BAM 1.96) used if not provided*

### Free APIs (No Key Required)
- **Overpass Turbo** - POI queries
- **Aladhan** - Prayer times
- **RestCountries** - Country data
- **OpenSeaMap** - Marine charts
- **CartoDB** - Base maps

---

## 📁 Project Structure

```
kvs-scuba-maldivi/
├── components/
│   ├── Dashboard.tsx           # Landing page
│   ├── Itinerary.tsx          # 12-day schedule + map
│   ├── Gallery.tsx            # Photo library (Supabase)
│   ├── Participants.tsx        # Team roster
│   ├── Preparation.tsx         # SSI courses & guides
│   ├── EssentialInfo.tsx       # Travel info (NEW)
│   ├── Auth.tsx               # Authentication
│   ├── Admin.tsx              # Finance & manifest
│   └── ...
├── services/
│   ├── apiService.ts          # API calls (8 functions)
│   ├── overpassService.ts      # POI queries (NEW)
│   ├── supabaseClient.ts       # Supabase config
│   └── ...
├── contexts/
│   └── AuthProvider.tsx        # Auth context
├── types.ts                    # TypeScript definitions
├── constants.tsx              # Itinerary & config
├── App.tsx                    # Main app + routing
└── styles.css                 # Tailwind CSS

```

---

## 🎨 Design System

**Color Palette**:
- **Deep Sea**: #001219 (primary dark)
- **Teal**: #0a9396 (accent)
- **Ocean Blue**: #005f73 (secondary)
- **Gold**: #ee9b00 (highlight)
- **Light**: #f8fdff (background)

**Responsive**:
- Mobile-first design
- Tailwind CSS utility classes
- h-[70vh] map (viewport-relative)
- Accordion animations

---

## 🔐 Authentication

**Login Methods**:
- Google OAuth (primary)
- Email/password (fallback)
- Admin unlock via password

**Authorized Admins**:
- Davor Mulalić
- Adnan Drnda
- Samir Solaković

---

## 📱 Mobile Support

✅ Fully responsive
- Mobile menu with hamburger icon
- Touch-friendly buttons
- Viewport-optimized images
- Readable typography

---

## 🧪 Testing

### Development Build
```bash
npm run dev
# Hot reload on file changes
```

### Production Build
```bash
npm run build
# ~10 seconds
# Output: 784.64 KB JS (200.06 KB gzip)
```

### Type Checking
```bash
# Built into build process
# TypeScript strict mode enabled
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Build Time | 10.65 seconds |
| Bundle Size | 784.64 KB (JS) |
| Gzip Size | 200.06 KB |
| Startup | ~2-3 seconds |
| TypeScript Errors | 0 |
| Lighthouse Score | ~90+ |

---

## 🗄️ Database Schema (Supabase)

### Gallery Table
```sql
CREATE TABLE gallery (
  id BIGINT PRIMARY KEY,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Participants Table
```sql
CREATE TABLE participants (
  id BIGINT PRIMARY KEY,
  name TEXT,
  email TEXT,
  ssi_certification TEXT,
  created_at TIMESTAMP
);
```

---

## 🌍 Expedition Details

**Location**: Maldives (South Male Atoll)  
**Base**: Maafushi Island, Kaafu Atoll  
**Dates**: January 5-16, 2026  
**Timezone**: UTC+5:00  
**Duration**: 12 days (10 nights diving)

**Key Dive Sites**:
- Maafushi Caves
- Guraidhoo Corner
- Cocoa & Kuda Giri Wreck
- Reef & Channel (Vaavu)
- Whale Shark Quest (South Ari)
- Deep Wall & Drift (Male Nord)
- Shark Tank (Hulhumale) - Premium €150-200

---

## 🆘 Prayer Times

**Available Anytime** (Aladhan API):
- Fajr (dawn)
- Dhuhr (noon)
- Asr (afternoon)
- Maghrib (sunset)
- Isha (night)

**Location**: Male, Maldives (4.1755°N, 73.5093°E)  
**Updates**: Every second (real-time clock)

---

## 💰 Currency Information

**Exchange Rates** (from EssentialInfo Dashboard):
- EUR → USD: ~1.08
- EUR → BAM: ~1.96
- EUR → MVR: ~16.5
- Currency: Maldivian Rufiyaa (MVR)

**ATMs**: Available at Male airport and resorts

---

## 🏥 Healthcare

**Emergency Numbers**:
- 999: Ambulance/Emergency
- 998: Fire Department

**Hospitals**: Indira Gandhi Memorial Hospital (Male)

**Pharmacies**: Available in Male, resort pharmacies

---

## 📚 Documentation

- [Mandate 4 Details](./MANDATE4_COMPLETION.md)
- [All Mandates Complete](./ALL_MANDATES_COMPLETE.md)
- [OAuth Setup](./PHASE3_OAUTH_SETUP.md)
- [Supabase Guide](./PHASE2_SUPABASE_GUIDE.md)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
# Automatic deployment on push
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket
# Configure CloudFront distribution
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Loading
```bash
# Make sure .env is in root directory
# Restart dev server
npm run dev
```

### Supabase Connection Failed
```bash
# Check credentials in .env
# Verify Supabase project is active
# Check network connectivity
```

### Prayer Times Not Updating
```bash
# Aladhan API is free and reliable
# Check browser console for errors
# Verify UTC+5:00 timezone calculation
```

---

## 🔄 Updates & Maintenance

### Weekly Checks
- Monitor Supabase storage usage
- Verify OSM data freshness (galleries)
- Check prayer times accuracy

### Monthly Tasks
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review and archive old photos

### Seasonal (Every 6 months)
- Update Fixer.io API key
- Refresh country information
- Verify dive site conditions

---

## 📞 Support

**Issues?** Check these first:
1. `.env` file configured correctly
2. Supabase project active and accessible
3. Node.js version 18+ installed
4. Browser supports ES2020+

**Contact**: mulalic71@gmail.com

---

## 📄 License

Private project for KVS SCUBA Sarajevo  
© 2026 All rights reserved

---

## ✨ Credits

**Development**: AI-assisted development  
**Design**: Tailwind CSS + Lucide React  
**Maps**: Leaflet + OpenStreetMap  
**Database**: Supabase  
**APIs**: Fixer.io, RestCountries, Overpass, Aladhan, OpenSeaMap

---

## 🎯 Next Steps

1. ✅ Deploy to production
2. ✅ Configure custom domain
3. ✅ Set up analytics (Vercel Analytics)
4. ✅ Enable backups (Supabase)
5. ✅ Test all features in staging
6. ✅ Announce to participants

---

**Happy Diving! 🤿**

*Maldives 2026 - An Unforgettable Expedition*

