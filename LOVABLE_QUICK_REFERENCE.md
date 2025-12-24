# LOVABLE.DEV QUICK REFERENCE CARD

## 🚀 DEPLOYMENT IN 7 STEPS

### 1️⃣ CONNECT GITHUB
- Go to lovable.dev → New Project → Import from GitHub
- Select: `PromptHeroStudio/kvs-scuba-maldivi`
- Branch: `main`

### 2️⃣ ENVIRONMENT VARIABLES
Set in Lovable project settings:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-secret
VITE_API_URL=https://your-domain.com
VITE_APP_URL=https://your-domain.com
VITE_GOOGLE_GENAI_API_KEY=your-genai-key
VITE_FIXER_API_KEY=your-fixer-key
```

### 3️⃣ BUILD CONFIGURATION
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: `18.x` or `20.x`
- npm Version: `9.x` or `10.x`

### 4️⃣ SUPABASE DATABASE
- Create project at supabase.com
- Run `supabase_migration.sql` in SQL Editor
- Create storage buckets: diver-photos, certificates, site-images, gallery-uploads, documents
- Enable RLS on all tables
- Create RLS policies (see settings.md)

### 5️⃣ GOOGLE OAUTH
1. Go to console.cloud.google.com
2. Create OAuth 2.0 credentials (Web app)
3. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-lovable-domain.vercel.app`
4. Authorized Redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-lovable-domain.vercel.app/auth/callback`

### 6️⃣ SUPABASE REDIRECT URLS
In Supabase → Settings → Authentication → URL Configuration:
- Site URL: `https://your-lovable-domain.vercel.app`
- Redirect URLs: `https://your-lovable-domain.vercel.app/auth/callback`

### 7️⃣ DEPLOY
- Click "Deploy to Production"
- Wait 5-15 minutes
- Click "Visit Site"

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Homepage loads without errors
- [ ] Google login redirects and returns
- [ ] Diver list loads from database
- [ ] Navigation works (all menu items)
- [ ] Language switch works (BS ↔ EN)
- [ ] Dark/Light mode toggle works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Admin panel accessible to admins
- [ ] Forms submit correctly
- [ ] Console has no critical errors
- [ ] Performance is good (< 3s load)

---

## 📦 KEY TECHNOLOGIES

| Technology | Version |
|-----------|---------|
| React | 19.2.3 |
| Vite | 6.2.0 |
| TypeScript | 5.8.2 |
| Tailwind CSS | 3.4.1 |
| Supabase | 2.38.0 |
| Node.js | >=18.0.0 |

---

## 🔑 ENVIRONMENT VARIABLES GUIDE

### How to Get Each Variable

**Supabase:**
1. Create project at supabase.com
2. Go to Settings → API
3. Copy Project URL and anon key

**Google OAuth:**
1. Go to console.cloud.google.com
2. Create credentials (Web app)
3. Copy Client ID and Secret
4. Add redirect URIs

**Fixer API:**
1. Visit fixer.io
2. Create API key for currency conversion

**Google Genai:**
1. Go to ai.google.dev
2. Create API key for Gemini

---

## 🗄️ DATABASE TABLES SUMMARY

| Table | Purpose | Rows/Records |
|-------|---------|-------------|
| users | Authentication & profiles | Many |
| divers | Diver information | ~30 |
| dive_sites | Maldives locations | ~20 |
| itinerary | Daily schedule | ~12 |
| bookings | Dive reservations | ~50 |
| payments | Financial tracking | ~30 |
| gallery | Photos & uploads | Many |

---

## 🚨 TROUBLESHOOTING

### Build Fails
✅ Check `package.json` for typos  
✅ Run `npm install` locally  
✅ Verify all deps listed

### Blank Page
✅ Check browser console for errors  
✅ Verify all env vars set  
✅ Check build log

### Auth Fails
✅ Verify Google OAuth credentials  
✅ Check redirect URIs  
✅ Clear browser cache

### Data Not Loading
✅ Verify Supabase URL/key  
✅ Check RLS policies  
✅ Verify database tables exist

### Assets 404
✅ Verify `outDir: 'dist'` in vite.config.ts  
✅ Check build output  
✅ Review build log

---

## 📱 RESPONSIVE BREAKPOINTS

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column, fixed nav |
| Tablet | 768-1024px | Dual column |
| Desktop | > 1024px | Multi-column, sidebar |

---

## 🎨 COLOR PALETTE

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #005f73 | Buttons, headers |
| Secondary | #0a9396 | Accents, highlights |
| Accent | #ee9b00 | Warnings, alerts |
| Success | #10b981 | Confirmations |
| Background | #f8fdff | Light mode |
| Dark | #001219 | Dark mode |

---

## 👥 ADMIN ACCESS

**Layer 1: Named Admin**
```typescript
AUTHORIZED_ADMINS = ["Davor Mulalić", "Adnan Drnda", "Samir Solaković"]
```

**Layer 2: PIN**
```
PIN: 1919
```

**Access:** Double-click logo OR login as Admin + PIN

---

## 🌍 LANGUAGES SUPPORTED

- **BS** (Bosnian) - Default
- **EN** (English)

Language persists in localStorage

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Tool |
|--------|--------|------|
| Load Time | < 3s | Lighthouse |
| API Response | < 500ms | Network tab |
| Lighthouse Score | > 90 | PageSpeed |
| Mobile Friendly | 100% | Mobile view |

---

## 🔐 SECURITY CHECKLIST

- ✅ Never commit `.env.local`
- ✅ Use `VITE_` prefix for public vars
- ✅ Keep service keys server-side
- ✅ Rotate API keys regularly
- ✅ RLS on all tables
- ✅ HTTPS in production
- ✅ Monitor auth logs

---

## 📚 IMPORTANT LINKS

| Resource | Link |
|----------|------|
| GitHub | https://github.com/PromptHeroStudio/kvs-scuba-maldivi |
| Supabase | https://supabase.com |
| Lovable.dev | https://lovable.dev |
| React Docs | https://react.dev |
| Vite Docs | https://vite.dev |
| Tailwind Docs | https://tailwindcss.com |

---

## 📞 SUPPORT

**Issues:** https://github.com/PromptHeroStudio/kvs-scuba-maldivi/issues  
**Manager:** Davor Mulalić  
**Organization:** https://github.com/PromptHeroStudio  

---

## ⚡ QUICK COMMANDS

```bash
# Local Development
npm install
npm run dev              # Start dev server on localhost:3000

# Build
npm run build            # Production build
npm run preview          # Preview dist locally

# Type Checking
npm run lint             # TypeScript check
tsc --noEmit             # Strict type check

# Deployment
npm run predeploy        # Pre-deployment checks
npm run deploy           # Build and prepare for deploy
```

---

## 🎯 DEPLOYMENT READINESS

- ✅ GitHub repo configured
- ✅ package.json complete
- ✅ .env.example updated
- ✅ Database schema ready
- ✅ OAuth configured
- ✅ API keys obtained
- ✅ TypeScript passes
- ✅ Build succeeds
- ✅ Responsive design verified
- ✅ Post-deploy tests planned

---

**Version:** 1.0.0  
**Date:** December 24, 2025  
**Status:** ✅ READY FOR DEPLOYMENT  

For detailed information, see **settings.md** (1070 lines)
