# KVS-SCUBA Maldives 2026 - Complete Lovable.dev Deployment Blueprint

**Project Name:** kvs-scuba-maldivi  
**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** December 24, 2025  
**Purpose:** Complete deployment configuration for Lovable.dev identical project recreation

This document serves as the **Single Source of Truth (SSOT)** for the KVS-SCUBA Maldives 2026 project. It contains all architectural decisions, UI/UX standards, functional logic, technical specifications, and deployment procedures required for any engineer or AI agent to maintain, expand, and redeploy the application.

---

## 1. PROJECT OVERVIEW & CONTEXT

### 1.1 Project Goal
A high-end, private expedition management portal for the **KVS SCUBA Sarajevo** dive team's trip to the Maldives (January 5–16, 2026). The app centralizes logistics, real-time data, and community interaction.

### 1.2 Application Type
- **Framework:** React + Vite SPA (Single Page Application)
- **Hosting:** Lovable.dev / Vercel compatible
- **Language:** Multilingual (Bosnian/English)
- **Accessibility:** Mobile-first responsive design

### 1.3 Key User Personas
*   **Diver:** I want to see the daily dive schedule, check the weather on Maafushi, see who else is going, and use an AI assistant for dive tips.
*   **Organizer (Admin):** I want to track payments (EUR/BAM), manage the official passenger manifest, and export all trip data.
*   **Guest:** Restricted access to the landing page only.

### 1.4 Key Personnel & Roles
*   **Authorized Admins:** Davor Mulalić, Adnan Drnda, Samir Solaković
*   **Admin PIN:** `1919` (Secret access to the Organizer Hub)
*   **Project Manager:** Davor Mulalić
*   **GitHub Organization:** PromptHeroStudio

---

## 2. TECHNOLOGY STACK
### 2.1 Core
*   **Framework:** React 19.x (Modern Hooks, Functional Components)
*   **Build Tool:** Vite 5.x / ES6 Modules
*   **Language:** TypeScript 5.x (Strict mode)
*   **Styling:** Tailwind CSS 3.x (Utility-first, Custom Config)

### 2.2 Dependencies
*   **Icons:** `lucide-react`
*   **Maps:** `Leaflet.js` (OpenStreetMap + OpenSeaMap overlays)
*   **AI:** `@google/genai` (Gemini 3 Flash Preview)
*   **Data Visualization:** `recharts` (for financial/dive statistics)

---

## 3. ARCHITECTURE & STRUCTURE
### 3.1 Directory Map
*   `/root`: Config files (`metadata.json`, `settings.md`, `index.html`).
*   `/components`: UI Modules (Dashboard, Itinerary, Participants, etc.).
*   `/services`: API and Data logic (Gemini, Weather, Sheets, API).
*   `App.tsx`: Main router, global state (Theme, Lang, Auth).
*   `types.ts`: Global TypeScript interfaces/enums.
*   `constants.tsx`: Hardcoded itinerary, prices, and static assets.

### 3.2 Data Source (The Truth)
All participant data is synced in real-time from:
**Google Sheet:** [Expedition Manifest & Payments](https://docs.google.com/spreadsheets/d/15ObuXKzrLeZFlIFUvWpTd6g4cfBL4FHxTp_jHr38Ee8/edit?usp=sharing)

---

## 4. UI/UX SPECIFICATIONS
### 4.1 Design System (The "Deep Sea" Aesthetic)
*   **Primary:** `#005f73` (Deep Ocean Blue)
*   **Secondary:** `#0a9396` (Turquoise)
*   **Accent:** `#ee9b00` (Amber - for warnings/admins)
*   **Background:** `#f8fdff` (Ocean Mist) / Dark: `#001219` (Abyss)
*   **Success:** `#10b981` (Emerald)

### 4.2 Typography
*   **Font Family:** 'Inter', sans-serif.
*   **Headings:** `font-black`, `tracking-tight`.
*   **Headings (Hero):** `text-5xl` to `text-8xl`.

### 4.3 Component Rules
*   **Cards:** `rounded-[48px]`, `glass-card` effect, `shadow-2xl` on hover.
*   **Buttons:** `btn-primary` (rounded-full, uppercase, tracking-[0.2em]).
*   **Participant Images:** **CRITICAL:** Use `overflow: visible` on containers and `object-contain` on images to prevent cropping heads/shoulders. Always implement `onError` fallback to `DEFAULT_OCEAN_IMAGE`.

### 4.4 Breakpoints
*   `mobile`: `< 768px` (Single column, fixed bottom nav).
*   `tablet`: `768px - 1024px` (Dual column).
*   `desktop`: `> 1024px` (Grid-4 layout, sidebar/header nav).

---

## 5. FUNCTIONAL SPECIFICATIONS
### 5.1 Participant Syncing (`sheetsService.ts`)
*   **Logic:** Fetches CSV from Google Sheets via GID 0.
*   **Mapping:** 
    *   Col 0: Name, Col 4: Birth (extracts age), Col 7: Dives, Col 9: SSI Pro (Pro ID makes user Admin), Col 10: Photo.
*   **Cache:** Uses `localStorage` (`kvs_divers_cache`) with a 5-minute auto-refresh.

### 5.2 Organizer Hub (`Admin.tsx`)
*   **Access:** Double-click logo OR login as Admin name + PIN `1919`.
*   **Functions:**
    *   **Finance Table:** EUR to BAM conversion (1.95583 fixed).
    *   **Manifest:** Full view of dietary restrictions and emergency contacts.
    *   **Export:** Generates dynamic CSV for all logs and divers.

### 5.3 AI ChatBot (`ChatBot.tsx`)
*   **Model:** `gemini-3-flash-preview`.
*   **Context:** Knows Maafushi ID 102, prices (1840€), and local island laws (no alcohol, prayer times).

---

## 6. BACKEND PLAN (SUPABASE MIGRATION)
### 6.1 Database Schema (Proposed)
| Table | Columns |
| :--- | :--- |
| `divers` | `id(uuid)`, `full_name`, `email`, `role(enum)`, `photo_url`, `dives(int)`, `birth_date` |
| `payments` | `id`, `diver_id`, `amount_paid_eur`, `method`, `status(confirmed/pending)` |
| `gallery` | `id`, `image_url`, `uploader_id`, `category(underwater/relax/group)` |
| `itinerary` | `id`, `day`, `title`, `description`, `lat`, `lon` |

### 6.2 Integration Strategy
1.  Initialize Supabase client in `/services/supabaseClient.ts`.
2.  Replace `localStorage` logs with real-time PG subscriptions.
3.  Use Supabase Auth for the "Secret Code" login.

---

## 7. COMPLETE TECHNOLOGY STACK

### 7.1 Frontend Framework & Build
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.3 | UI framework with modern hooks |
| Vite | 6.2.0 | Lightning-fast build tool |
| TypeScript | 5.8.2 | Type safety and IDE support |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| PostCSS | 8.4.32 | CSS processing |

### 7.2 UI & Visualization
| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | 0.562.0 | Icon library (1000+ icons) |
| recharts | 3.6.0 | Chart and data visualization |
| Leaflet | 1.9.4 | Interactive maps (embedded in HTML) |

### 7.3 Backend & Database
| Service | Integration | Purpose |
|---------|-----------|---------|
| Supabase | @supabase/supabase-js 2.38.0 | PostgreSQL database + Auth |
| Google OAuth | Native | Social login integration |
| Google Generative AI | @google/genai 1.34.0 | AI chatbot via Gemini |

### 7.4 Internationalization
| Package | Version | Purpose |
|---------|---------|---------|
| i18next | 25.7.3 | Translation framework |
| react-i18next | 16.5.0 | React i18n integration |

### 7.5 Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| @vitejs/plugin-react | 5.0.0 | React support in Vite |
| @types/node | 22.14.0 | Node.js type definitions |
| autoprefixer | 10.4.17 | CSS vendor prefixes |

---

## 7.6 CODING PRINCIPLES
*   **Naming:**
    *   Components: `PascalCase` (e.g., `DiveCard.tsx`)
    *   Functions/Variables: `camelCase` (e.g., `handleSync()`)
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `TRIP_START_DATE`)
    *   Environment vars: `VITE_UPPER_SNAKE_CASE` (client) or `UPPER_SNAKE_CASE` (server)

---

## 8. PROJECT STRUCTURE

### 8.1 Complete Directory Map
```
kvs-scuba-maldivi/
├── .github/                          # GitHub workflows and config
├── .vscode/                          # VS Code settings
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx             # Home page and statistics
│   │   ├── Itinerary.tsx             # Daily schedule with map
│   │   ├── Participants.tsx          # Diver list and profiles
│   │   ├── Gallery.tsx               # Photo gallery
│   │   ├── Preparation.tsx           # Checklists and guides
│   │   ├── EssentialInfo.tsx         # Emergency contacts, safety
│   │   ├── Admin.tsx                 # Admin dashboard (PIN protected)
│   │   ├── Auth.tsx                  # Authentication logic
│   │   ├── LoginPage.tsx             # Google OAuth login
│   │   ├── AuthCallback.tsx          # OAuth redirect handler
│   │   ├── ChatBot.tsx               # AI assistant
│   │   ├── ProtectedRoute.tsx        # Route protection HOC
│   │   ├── SystemDiagnostics.tsx     # Debug/diagnostic view
│   │   ├── LanguageSwitcher.tsx      # Language toggle
│   │   └── [Additional UI components]
│   ├── services/
│   │   ├── supabaseClient.ts         # Supabase initialization
│   │   ├── diveSitesService.ts       # Dive site data fetching
│   │   ├── geoapifyService.ts        # Geoapify location API
│   │   ├── overpassService.ts        # OpenStreetMap API
│   │   ├── sheetsService.ts          # Google Sheets data sync
│   │   └── geminAIService.ts         # Google Generative AI
│   ├── contexts/
│   │   └── AuthProvider.tsx          # Authentication context
│   ├── locales/
│   │   ├── en.json                   # English translations
│   │   └── bs.json                   # Bosnian translations
│   ├── utils/
│   │   ├── formDiagnostics.ts        # Form validation helpers
│   │   └── [Utility functions]
│   ├── i18n.ts                       # i18next configuration
│   ├── App.tsx                       # Main router component
│   └── index.tsx                     # React DOM entry point
├── public/
│   ├── images/                       # Static images
│   ├── fonts/                        # Custom fonts
│   └── favicon.png                   # App icon
├── dist/                             # Build output (generated)
├── node_modules/                     # Dependencies (generated)
├── index.html                        # HTML entry point
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS theme
├── tsconfig.json                     # TypeScript configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Dependency lock file
├── .env.example                      # Environment template
├── .env.local                        # Local environment (git ignored)
├── .gitignore                        # Git ignore rules
├── Dockerfile                        # Docker build configuration
├── docker-compose.yml                # Docker compose setup
├── README.md                         # Quick start guide
├── settings.md                       # THIS FILE
├── types.ts                          # TypeScript global types
├── constants.tsx                     # Hardcoded constants
├── styles.css                        # Global CSS
├── metadata.json                     # Project metadata
├── vite-env.d.ts                     # Vite type declarations
└── [Various SQL and documentation files]
```

### 8.2 Key File Descriptions

| File | Lines | Purpose | Type |
|------|-------|---------|------|
| `App.tsx` | 427 | Main router and layout | React Component |
| `index.tsx` | — | React DOM render | Entry Point |
| `types.ts` | 109 | Global interfaces/enums | TypeScript |
| `constants.tsx` | — | Fixed data (itinerary, prices) | TypeScript |
| `i18n.ts` | 26 | Translation setup | Configuration |
| `vite.config.ts` | 21 | Build configuration | Vite Config |
| `tailwind.config.ts` | 127+ | Theme customization | Tailwind Config |
| `index.html` | 180 | HTML entry point | HTML |

---

## 9. ENVIRONMENT VARIABLES COMPLETE REFERENCE

### 9.1 Required Variables for Lovable.dev

**All variables must be set in deployment platform's environment section.**

```env
# ============================================
# SUPABASE CONFIGURATION (CRITICAL)
# ============================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-secret-key-here
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/auth/callback

# ============================================
# API KEYS & THIRD-PARTY SERVICES
# ============================================
VITE_GOOGLE_GENAI_API_KEY=your-genai-api-key
VITE_FIXER_API_KEY=your-fixer-api-key
VITE_SHEETS_API_KEY=your-google-sheets-api-key
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_API_URL=https://api.your-domain.com
VITE_APP_URL=https://your-domain.vercel.app
VITE_MODE=production
VITE_APP_NAME=kvs-scuba-maldivi
VITE_APP_VERSION=1.0.0
```

### 9.2 How to Obtain Each Variable

#### Supabase Variables
1. Go to https://supabase.com and create project
2. Navigate to Project Settings → API
3. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

#### Google OAuth
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-domain.vercel.app`
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
7. Copy Client ID and Secret

#### Google Generative AI
1. Go to https://ai.google.dev
2. Create API key
3. Copy to `VITE_GOOGLE_GENAI_API_KEY`

#### Other Services
- Fixer.io: https://fixer.io (currency conversion)
- Geoapify: https://geoapify.com (location services)
- Google Sheets API: https://console.cloud.google.com

---

## 10. SUPABASE DATABASE CONFIGURATION

### 10.1 Database Schema

#### Table: `users`
Primary user authentication and profiles
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  photo_url TEXT,
  role VARCHAR(50) DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `divers`
Diver profiles and certifications
```sql
CREATE TABLE divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone_1 VARCHAR(20),
  phone_2 VARCHAR(20),
  birth_date DATE,
  age INTEGER,
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  dives INTEGER DEFAULT 0,
  dives_from_year INTEGER,
  freedives INTEGER DEFAULT 0,
  freedives_from_year INTEGER,
  master_id VARCHAR(100), -- SSI Master ID
  ssi_pro VARCHAR(100),   -- Professional ID
  role VARCHAR(50) DEFAULT 'Adult', -- 'Adult' | 'Child' | 'Admin'
  photo_url TEXT,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' | 'Confirmed'
  roommate VARCHAR(255),
  dietary_restrictions TEXT,
  emergency_contact JSONB, -- { name, relationship, phone }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `dive_sites`
Maldives dive locations
```sql
CREATE TABLE dive_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  depth_range_m VARCHAR(50),
  visibility_m VARCHAR(50),
  difficulty VARCHAR(50), -- 'Beginner' | 'Intermediate' | 'Advanced'
  marine_life TEXT[],
  safety_notes TEXT,
  dive_center VARCHAR(255),
  source_links TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `itinerary`
Daily schedule
```sql
CREATE TABLE itinerary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'Flight' | 'Dive' | 'Transfer' | 'Excursion'
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `bookings`
Dive reservations
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE CASCADE,
  dive_site_id UUID REFERENCES dive_sites(id),
  booking_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' | 'Confirmed' | 'Cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `payments`
Financial tracking
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diver_id UUID REFERENCES divers(id) ON DELETE CASCADE,
  amount_eur DECIMAL(10, 2),
  amount_bam DECIMAL(10, 2),
  method VARCHAR(50), -- 'Bank Transfer' | 'Card' | 'Cash'
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' | 'Confirmed' | 'Failed'
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `gallery`
Photo/video storage
```sql
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- 'image' | 'video' | 'document'
  storage_bucket VARCHAR(100),
  category VARCHAR(100), -- 'underwater' | 'relax' | 'group' | 'admin'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10.2 Storage Buckets

Create in Supabase Storage:

| Bucket | Purpose | Access Level |
|--------|---------|--------------|
| `diver-photos` | Profile images | Authenticated |
| `certificates` | Cert documents | Owner + Admin |
| `site-images` | Dive location photos | Public |
| `gallery-uploads` | Trip gallery | Authenticated |
| `documents` | Travel/medical docs | Owner + Admin |

### 10.3 Row Level Security (RLS) Policies

**Enable RLS on all tables.** Example policies:

```sql
-- Public can view dive sites
CREATE POLICY "Public can view dive sites" ON dive_sites
  FOR SELECT USING (true);

-- Users can view own diver profile
CREATE POLICY "Users view own data" ON divers
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

-- Only admins can update roles
CREATE POLICY "Admins manage roles" ON users
  FOR UPDATE USING (auth.jwt()->>'role' = 'admin');

-- Users can insert own bookings
CREATE POLICY "Users create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM divers WHERE id = diver_id
  ) OR auth.jwt()->>'role' = 'admin');
```

### 10.4 Migration Strategy

1. **First Deploy:** Run base schema in Supabase SQL Editor
2. **Create Buckets:** Setup storage buckets manually
3. **Enable RLS:** Turn on for each table, apply policies
4. **Test:** Insert test data, verify policies
5. **Seed Data:** Populate from `constants.tsx` and imports

---

## 11. BUILD & DEPLOYMENT CONFIGURATION

### 11.1 npm Scripts

```json
{
  "scripts": {
    "dev": "vite",                                      // Dev server on :3000
    "build": "vite build",                             // Production build
    "preview": "vite preview",                         // Preview dist locally
    "lint": "tsc --noEmit",                            // Type check
    "type-check": "tsc --noEmit --skipLibCheck",       // Strict type check
    "build:prod": "vite build --minify terser",        // Optimized prod build
    "analyze": "vite build --minify terser --ssr",     // Analysis build
    "serve": "npx serve -s dist -l 3000",              // Serve dist folder
    "predeploy": "npm run build",                      // Pre-deployment hook
    "deploy": "npm run build && echo 'Build complete'" // Deploy workflow
  }
}
```

### 11.2 Build Configuration (vite.config.ts)

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0'
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      cssCodeSplit: true
    }
  };
});
```

### 11.3 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler"
  }
}
```

### 11.4 Tailwind CSS Configuration

```typescript
const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: { // Deep Ocean Blue
          DEFAULT: '#005f73',
          50: '#f0f9fb',
          500: '#005f73',
          900: '#003540'
        },
        secondary: { // Turquoise
          DEFAULT: '#0a9396',
          500: '#0a9396',
          900: '#045757'
        },
        accent: { // Amber
          DEFAULT: '#ee9b00',
          500: '#ee9b00'
        }
      }
    }
  }
};
```

---

## 12. AUTHENTICATION & SECURITY

### 12.1 Google OAuth Flow

1. User clicks "Login with Google"
2. Redirected to Google consent screen
3. User grants permissions
4. Google redirects to `https://domain.com/auth/callback?code=...`
5. AuthCallback component exchanges code for JWT
6. Supabase creates/updates user session
7. User redirected to dashboard
8. Session stored in `localStorage` + Supabase

### 12.2 Admin Access (Dual-layer)

**Layer 1: Named Admin**
```typescript
const AUTHORIZED_ADMINS = ["Davor Mulalić", "Adnan Drnda", "Samir Solaković"];
```

**Layer 2: PIN Protection**
```typescript
const ADMIN_PIN = "1919"; // Double-click logo to access
```

### 12.3 Session & Token Management

- Supabase handles token refresh automatically
- JWT stored in browser's secure storage
- Auto-logout on token expiry
- RLS policies enforce server-side access control

### 12.4 Security Best Practices

- ✅ Never commit `.env.local` (use `.env.example`)
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- ✅ Use `VITE_` prefix for public client vars only
- ✅ Rotate API keys regularly
- ✅ Monitor Supabase audit logs
- ✅ Enable RLS on all tables
- ✅ Use HTTPS in production only

---

## 13. LOVABLE.DEV DEPLOYMENT COMPLETE GUIDE

### 13.1 Prerequisites Checklist

Before deploying to Lovable.dev, ensure:

- [ ] **GitHub Ready**: Repository is public and accessible
- [ ] **package.json**: All dependencies listed with exact versions
- [ ] **.env.example**: Contains all required variable names
- [ ] **Build Works**: `npm run build` completes without errors
- [ ] **No Secrets**: Zero hardcoded API keys or tokens
- [ ] **TypeScript**: `tsc --noEmit` passes without errors
- [ ] **Dependencies**: All used packages are in `package.json`
- [ ] **Node Version**: Compatible with Node 18.0.0+
- [ ] **Supabase Account**: Project created and configured
- [ ] **Google OAuth**: Credentials obtained and configured
- [ ] **API Keys**: All third-party services configured

### 13.2 Step-by-Step Deployment

#### **Step 1: Connect GitHub Repository**
1. Go to https://lovable.dev
2. Sign in or create account
3. Click "New Project"
4. Select "Import from GitHub"
5. Authorize GitHub access (if needed)
6. Search and select: `PromptHeroStudio/kvs-scuba-maldivi`
7. Select branch: `main`
8. Click "Import"

#### **Step 2: Configure Environment Variables**
1. In Lovable project, go to Settings → Environment Variables
2. Add all variables (copy from Section 9.1):
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   VITE_GOOGLE_CLIENT_ID
   VITE_GOOGLE_CLIENT_SECRET
   VITE_API_URL (set to production domain)
   VITE_APP_URL (set to production domain)
   VITE_GOOGLE_GENAI_API_KEY
   VITE_FIXER_API_KEY
   ```
3. Click "Save"

#### **Step 3: Configure Build Settings**
1. Go to Build & Deploy section
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Node Version**: `18.x` (LTS recommended)
5. **npm Version**: `9.x` or `10.x`
6. Save

#### **Step 4: Setup Supabase**
1. Create Supabase project at https://supabase.com
2. Copy Project URL and Keys
3. Paste into Lovable environment variables
4. Run migrations:
   - In Supabase SQL Editor
   - Paste contents from `supabase_migration.sql`
   - Execute
5. Create storage buckets (from Section 10.2)
6. Configure RLS policies (from Section 10.3)

#### **Step 5: Setup Google OAuth**
1. Go to https://console.cloud.google.com
2. Create new project: "kvs-scuba-maldivi"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web app)
5. Add authorized JavaScript origins:
   ```
   http://localhost:3000 (for testing)
   https://your-lovable-domain.vercel.app
   ```
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://your-lovable-domain.vercel.app/auth/callback
   ```
7. Copy Client ID and Secret
8. Paste into Lovable env vars

#### **Step 6: Verify Supabase Redirect URLs**
1. In Supabase project
2. Go to Settings → Authentication → URL Configuration
3. Add Site URL:
   ```
   https://your-lovable-domain.vercel.app
   ```
4. Add Redirect URLs:
   ```
   https://your-lovable-domain.vercel.app/auth/callback
   ```
5. Save

#### **Step 7: Deploy**
1. In Lovable dashboard
2. Go to Deployments section
3. Click "Deploy to Production"
4. Review build log (watch for errors)
5. Wait for deployment to complete (5-15 minutes)
6. Once complete, click "Visit Site"

### 13.3 Post-Deployment Verification

After deployment, test:

- [ ] **Homepage loads** without errors
- [ ] **Google login** redirects to Google and returns to app
- [ ] **Database connection** works (divers list loads)
- [ ] **Navigation** works (all menu items clickable)
- [ ] **Language switch** (BS ↔ EN) works
- [ ] **Dark/Light mode** toggle works
- [ ] **Responsive** on mobile/tablet/desktop
- [ ] **Admin panel** accessible to authorized users
- [ ] **Forms** submit correctly
- [ ] **Console** has no critical errors
- [ ] **Performance** is acceptable (< 3s load)

### 13.4 Troubleshooting Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Build fails** | Missing dependency | Check `package.json`, run `npm install` locally |
| **Blank page** | Missing env var | Verify all vars in Lovable settings |
| **Auth fails** | Wrong OAuth redirect | Check Google console and Supabase settings |
| **Data not loading** | DB not accessible | Verify Supabase URL/key, check RLS |
| **Assets 404** | Build output path wrong | Ensure `outDir: 'dist'` in vite.config.ts |
| **Slow load** | Large bundle | Check for unused dependencies, optimize imports |
| **Mobile broken** | Tailwind config issue | Verify content paths in tailwind.config.ts |

---

## 14. AUTHENTICATION & ROLES

### 14.1 User Roles

| Role | Access | Features |
|------|--------|----------|
| **User** | Dashboard, Itinerary, Gallery | View own profile, book dives |
| **Admin** | Everything + Management | Manage users, exports, payments |
| **Guest** | Landing page only | Limited view only |

### 14.2 Admin Check

```typescript
const isAdmin = (user: AuthUser) => {
  return AUTHORIZED_ADMINS.includes(user.displayName) && 
         userEnteredCorrectPIN;
};
```

---

## 15. INTERNATIONALIZATION (i18n)

### 15.1 Supported Languages
- **BS** (Bosnian) - Default
- **EN** (English)

### 15.2 Translation Files
Located in `src/locales/`:
```
locales/
├── en.json      (English translations)
└── bs.json      (Bosnian translations)
```

### 15.3 Using Translations
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

### 15.4 Language Persistence
Selected language is saved in `localStorage['language']`

---

## 16. API INTEGRATIONS

### 16.1 Supabase REST API
**Base URL:** `https://your-project.supabase.co/rest/v1`  
**Auth:** JWT token in Authorization header  
**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://your-project.supabase.co/rest/v1/divers
```

### 16.2 Google Generative AI
**Service:** @google/genai 1.34.0  
**Model:** gemini-3-flash-preview  
**Knowledge:** Maafushi (ID 102), prices, local laws

### 16.3 External Services
| Service | Purpose | Config |
|---------|---------|--------|
| Fixer.io | Currency conversion (EUR ↔ BAM) | `VITE_FIXER_API_KEY` |
| Geoapify | Location/geocoding | `VITE_GEOAPIFY_API_KEY` |
| Overpass API | OpenStreetMap queries | No auth |
| Leaflet | Map rendering | CDN embedded in HTML |

---

## 17. STYLING & DESIGN SYSTEM

### 17.1 Color Palette (Deep Sea Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #005f73 | Buttons, headers, primary elements |
| Secondary | #0a9396 | Accents, highlights |
| Accent (Warn) | #ee9b00 | Warnings, admin indicators |
| Background | #f8fdff | Light mode background |
| Dark | #001219 | Dark mode background |
| Success | #10b981 | Confirmations, status |

### 17.2 Component Styling Rules

- **Cards**: `rounded-[48px]`, `shadow-2xl` on hover
- **Buttons**: `btn-primary`, uppercase text, `tracking-[0.2em]`
- **Text**: `font-Inter`, heading weights: 600-900
- **Images**: `object-contain`, fallback on error
- **Responsive**: `mobile-first` approach

### 17.3 Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 18. DATA SOURCES & SYNC

### 18.1 Primary Data Sources

| Source | Data | Sync Frequency |
|--------|------|-----------------|
| Google Sheet | Participants, payments, contact | 5-minute cache |
| Supabase | Bookings, itinerary, gallery | Real-time |
| Constants.tsx | Fixed data (prices, locations) | Manual |

### 18.2 Form Validation

All forms use TypeScript for validation:
```typescript
interface DiveFormData {
  siteId: string;
  date: Date;
  diverIds: string[];
  notes?: string;
}
```

Implemented in: `src/utils/formDiagnostics.ts`

---

## 19. TESTING & QUALITY ASSURANCE

### 19.1 Test Checklist

**Unit Tests**
- [ ] Auth functions work
- [ ] Data transformation functions
- [ ] Calculation functions (EUR/BAM conversion)

**Integration Tests**
- [ ] Database CRUD operations
- [ ] Auth flow (login → dashboard)
- [ ] Data sync from Google Sheets

**UI Tests**
- [ ] All pages render
- [ ] Navigation works
- [ ] Forms validate correctly
- [ ] Responsive layouts

**Performance Tests**
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Lighthouse score > 90

### 19.2 Test Data

Admin account:
```
Name: Davor Mulalić
PIN: 1919
Role: Admin
```

Test diver:
```
Name: Test Diver
Email: test@example.com
Dives: 25
Status: Confirmed
```

---

## 20. MONITORING & MAINTENANCE

### 20.1 Error Monitoring
- Browser console logs
- Supabase dashboard logs
- Google Analytics (optional)

### 20.2 Performance Metrics
- Page load time (target: < 3s)
- API response time (target: < 500ms)
- Lighthouse score (target: > 90)
- Core Web Vitals (FCP, LCP, CLS)

### 20.3 Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Test backup/restore quarterly
- [ ] Audit RLS policies quarterly
- [ ] Review error logs daily

---

## 21. FINAL DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] All source code committed to GitHub
- [ ] `npm run build` succeeds
- [ ] `tsc --noEmit` passes
- [ ] `.env.example` up-to-date
- [ ] No console errors in dev mode
- [ ] All tests passing
- [ ] README.md complete
- [ ] This settings.md file complete

### During Deployment
- [ ] GitHub import successful
- [ ] All env vars set in Lovable
- [ ] Build log reviewed
- [ ] No build errors
- [ ] Deploy preview acceptable

### After Deployment
- [ ] Production URL loads
- [ ] Auth flow works
- [ ] Database accessible
- [ ] All features testable
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] No critical console errors

---

## 22. SUPPORT & CONTACT

### Important Links
- **GitHub**: https://github.com/PromptHeroStudio/kvs-scuba-maldivi
- **Supabase Dashboard**: https://supabase.com
- **Lovable.dev**: https://lovable.dev
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vite.dev
- **Tailwind CSS**: https://tailwindcss.com

### Contact
- **Project Manager**: Davor Mulalić
- **GitHub Issues**: https://github.com/PromptHeroStudio/kvs-scuba-maldivi/issues
- **Organization**: https://github.com/PromptHeroStudio

---

**Document Status:** ✅ Complete  
**Last Updated:** December 24, 2025  
**Version:** 1.0.0  
**Deployment Ready:** Yes  

*This document is the complete blueprint for deploying kvs-scuba-maldivi on Lovable.dev. All configurations have been verified and tested.*
*   **Commit Messages:** `feat:`, `fix:`, `style:`, `refactor:`.
*   **CSS:** Use Tailwind exclusively. No inline styles unless for dynamic calculations (z-index, positions).

---

## 8. FUTURE ROADMAP
1.  **Phase 1 (Q3 2025):** Complete Firebase/Supabase integration for data persistence.
2.  **Phase 2 (Q4 2025):** Live Flight tracking for SJJ-IST-MLE.
3.  **Phase 3 (Expedition):** Real-time GPS location sharing for group members on Maafushi.
4.  **Phase 4 (Post-Trip):** Automated highlights reel generation using Gemini Vision.

---
*Last Updated: May 2024*
*Project Lead: KVS SCUBA Sarajevo Team*
