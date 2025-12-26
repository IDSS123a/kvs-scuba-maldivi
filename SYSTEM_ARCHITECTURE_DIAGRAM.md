# KVS-Scuba Maldives 2026: System Architecture Diagram

## 1. USER JOURNEY FLOW

### Registration → Approval → Access Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  New User    │
│ (Unregistered)
└──────────┬───┘
           │
           ▼
    ╔════════════════╗
    ║  REGISTRATION  ║
    ║   (Phase 1)    ║
    ║   - Signup     ║
    ║   - Email      ║
    ║   - Name       ║
    ║   - SSI Number ║
    ╚════════┬───────╝
             │
             ▼
    ┌─────────────────────┐
    │ Create Auth Account │  ◄─── Supabase Auth
    │ Create User Profile │  ◄─── 'users' Table
    │ Role = 'pending'    │
    └────────┬────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ EMAIL VERIFICATION SENT  │ ◄─── Supabase Mailer
    │ User confirms via link   │
    └────────┬─────────────────┘
             │
             ▼
    ╔════════════════════════╗
    ║ ACCESS REQUEST REVIEW  ║
    ║   (Phase 2 - Pending)  ║
    ║ Admin checks:          ║
    ║  • Email verified?     ║
    ║  • Credentials valid?  ║
    ║  • Certification OK?   ║
    ╚════════┬───────────────╝
             │
      ┌──────┴──────┐
      │             │
   (Approve)    (Reject)
      │             │
      ▼             ▼
  ┌────────┐   ┌──────────┐
  │ Assign │   │ Status   │
  │  PIN   │   │ REVOKED  │
  └───┬────┘   └────┬─────┘
      │             │
      ▼             ▼
  ┌──────────────┐  ┌────────────────┐
  │ Access Grant │  │  Access Denied │
  │ Update Table │  │  Notify User   │
  │ audit_log    │  │  Send Email    │
  └───┬──────────┘  └─────────────────┘
      │
      ▼
  ╔═══════════════════════════╗
  ║  LOGIN WITH PIN (Phase 3) ║
  ║  - User enters 6-digit PIN ║
  ║  - Pin verification via DB │
  ║  - Create session token    ║
  ║  - Update last_login time  ║
  ╚═══════┬───────────────────╝
          │
          ▼
  ┌───────────────────────────┐
  │  FULL APPLICATION ACCESS  │
  │  - Dashboard visible      │
  │  - All features unlocked  │
  │  - Role-based features    │
  │  - Activity logged        │
  └───────────────────────────┘

Status Values in 'access_requests' Table:
  • pending  ──► Awaiting admin review
  • approved ──► Access granted, PIN assigned
  • revoked  ──► Access previously granted then withdrawn
```

---

## 2. DATABASE SCHEMA

### Five Core Tables and Relationships

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                   │
│                      (PostgreSQL via Supabase)                           │
└──────────────────────────────────────────────────────────────────────────┘


TABLE 1: divers (Main User Table)
┌─────────────────────────────────────┐
│          DIVERS                     │
├─────────────────────────────────────┤
│ id (UUID) [PK]                      │
│ name (TEXT)                         │
│ email (TEXT) [UNIQUE]               │
│ phone (TEXT)                        │
│ ssi_number (TEXT)                   │
│ certification_level (TEXT)          │
│ experience_level (INT)              │
│ date_of_birth (DATE)                │
│ nationality (TEXT)                  │
│ access_pin_hash (TEXT) [encrypted]  │
│ access_status (ENUM) [⬇️ link]      │
│ pin_created_at (TIMESTAMP)          │
│ last_login (TIMESTAMP)              │
│ is_pro (BOOLEAN) [Admin flag]       │
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘
         │                    │
         │                    └─────────────────┐
         │                                      │
         ▼                                      ▼
    ╔════════════════════╗          ╔═══════════════════════════════╗
    ║ access_requests    ║          ║ admin_audit_log               ║
    ║ (Access History)   ║          ║ (Admin Actions)               ║
    ╠════════════════════╣          ╠═══════════════════════════════╣
    │ id (UUID) [PK]     │          │ id (UUID) [PK]                │
    │ diver_id (FK) ─────┼─┐        │ admin_id (FK) ────────────┐   │
    │ request_status     │ │        │ action (TEXT)             │   │
    │ approved_by_id(FK) │ │        │ target_user_id (FK) ──┐   │   │
    │ approved_at (TS)   │ │        │ target_table (TEXT)   │   │   │
    │ notes (TEXT)       │ │        │ details (JSONB)       │   │   │
    │ created_at (TS)    │ │        │ created_at (TS)       │   │   │
    │ updated_at (TS)    │ │        └────────┬──────────────┘   │   │
    ╚════════════════════╝ │                 │                  │   │
                           │                 │                  │   │
                           └─────────────────┼──────────────────┘   │
                                             │                      │
                   ┌─────────────────────────┘                      │
                   │ (Admin User)                                   │
                   └──────────────────────────────────────────────────


TABLE 2: activity_logs (User Activity Tracking)
┌──────────────────────────────────────┐
│       ACTIVITY_LOGS                  │
├──────────────────────────────────────┤
│ id (UUID) [PK]                       │
│ user_id (UUID) [FK → divers.id]      │
│ activity_type (TEXT)                 │
│  • 'login_success'                   │
│  • 'login_failed'                    │
│  • 'signup_completed'                │
│  • 'access_requested'                │
│  • 'access_approved'                 │
│  • 'pin_verified'                    │
│  • 'session_start'                   │
│  • 'session_end'                     │
│ ip_address (TEXT)                    │
│ user_agent (TEXT)                    │
│ timestamp (TIMESTAMP)                │
│ metadata (JSONB) [optional]          │
└──────────────────────────────────────┘
         │
         └──► Used for security audits,
              compliance tracking


TABLE 3: users (Auth-Synced Profile)
┌──────────────────────────────────────┐
│         USERS (Legacy/Sync)          │
├──────────────────────────────────────┤
│ id (UUID) [PK, FK → auth.users]      │
│ email (TEXT)                         │
│ full_name (TEXT)                     │
│ role (TEXT)                          │
│  • 'admin'                           │
│  • 'moderator'                       │
│  • 'user'                            │
│  • 'pending'                         │
│ avatar_url (TEXT)                    │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
└──────────────────────────────────────┘
         │
         └──► Synced with Supabase Auth


TABLE 4: payments (Trip Payment Tracking)
┌──────────────────────────────────────┐
│        PAYMENTS                      │
├──────────────────────────────────────┤
│ id (UUID) [PK]                       │
│ diver_id (FK → divers.id)            │
│ trip_id (UUID)                       │
│ amount (DECIMAL)                     │
│ currency (VARCHAR 3) ['EUR', 'USD']  │
│ status (ENUM)                        │
│  • 'pending'                         │
│  • 'completed'                       │
│  • 'refunded'                        │
│ payment_date (TIMESTAMP)             │
│ receipt_url (TEXT)                   │
│ notes (TEXT)                         │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
└──────────────────────────────────────┘


TABLE 5: itinerary (Trip Schedule)
┌──────────────────────────────────────┐
│       ITINERARY                      │
├──────────────────────────────────────┤
│ id (UUID) [PK]                       │
│ trip_id (UUID)                       │
│ day_number (INT)                     │
│ date (DATE)                          │
│ activity (TEXT)                      │
│ location (TEXT)                      │
│ time (TIME)                          │
│ notes (TEXT)                         │
│ max_participants (INT)               │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
└──────────────────────────────────────┘


Relationship Summary:
─────────────────────
  divers (1) ──────► (N) access_requests
  divers (1) ──────► (N) activity_logs
  divers (1) ──────► (N) payments
  divers (1) ──────► (1) admin_audit_log (as admin_id)
  divers (1) ──────► (N) admin_audit_log (as target_user_id)
  payments (N) ──────► (1) itinerary (via trip_id)

Indexes Created:
────────────────
  • idx_divers_access_status
  • idx_divers_email_access
  • idx_divers_is_pro
  • idx_divers_pin_hash
  • idx_activity_user_type
  • idx_access_requests_status
```

---

## 3. COMPONENT TREE

### React Component Hierarchy and Organization

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENT TREE                                │
│                   (src/components directory)                             │
└──────────────────────────────────────────────────────────────────────────┘

                              ◄── App.tsx ──►
                         (Main Application Shell)
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌─────────────┐  ┌──────────┐  ┌─────────────┐
            │ AuthProvider│  │Dashboard │  │ LanguageSW  │
            │  (Context)  │  │          │  │  (i18n)     │
            └─────┬───────┘  └──────────┘  └─────────────┘
                  │
        ┌─────────┼─────────┬──────────┬──────────┐
        │         │         │          │          │
        ▼         ▼         ▼          ▼          ▼
    ┌──────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌─────────┐
    │Auth  │ │Protec- │ │admin/│ │layout/ │ │Checklist│
    │      │ │tedRoute│ │      │ │        │ │         │
    └──┬───┘ └────────┘ └──┬───┘ └────┬───┘ └────┬────┘
       │                   │          │          │
       ├─ LoginPage        │          │          └── ExpeditionChecklist.tsx
       │  ├─ PinLogin.tsx  │          │
       │  └─ SignUp        ├─ AdminDashboard.tsx
       │     ├─ Email      │  ├─ UserManagement.tsx
       │     ├─ Name       │  ├─ AccessControl.tsx
       │     └─ Verify     │  ├─ Dashboard.tsx
       │                   │  ├─ Analytics.tsx
       ├─ AuthCallback.tsx │  └─ Settings.tsx
       │                   │
       ├─ AuthPortal.tsx   │          └── Header.tsx
       └─ Logout           │          └── Footer.tsx
                           │          └── Navigation.tsx
                           │
                           └─ ProtectedRoute.tsx
                              (Role-checking wrapper)


Navigation Flow:
────────────────
  Public Routes:
    /auth ────────► LoginPage
    /signup ──────► AuthPortal (SignUp form)
    /callback ────► AuthCallback (OAuth redirect handler)

  Protected Routes (Authenticated users):
    /dashboard ───► Dashboard
    /checklist ───► ExpeditionChecklist
    /admin ───────► AdminDashboard (is_pro = true only)
    /guide ───────► MaldivesTripGuide


Component Props & State Flow:
──────────────────────────────
  AuthProvider
    ├── Provides: user, session, role, isLoading, refreshUser()
    ├── Consumes: AuthContext
    └── Manages: Global auth state via Supabase

  ProtectedRoute
    ├── Checks: user.role via useAuth()
    ├── Validates: 'approved' access_status
    └── Redirects: non-authenticated to /auth

  AdminDashboard (is_pro users only)
    ├── Tabs: UserManagement, AccessControl, Analytics
    ├── Permissions: approved admins only
    └── Actions: approve/revoke access, view audit logs

  LoginPage
    ├── Renders: PinLogin form
    ├── Handles: PIN verification
    └── On Success: Sets session, redirects to /dashboard

  ExpeditionChecklist
    ├── Displays: Packing items by category
    ├── State: Local checkbox tracking
    └── Export: PDF/print functionality
```

---

## 4. AUTHENTICATION FLOW

### Login Process and Role-Based Access

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                                   │
│                   (Login Process & Role Checking)                        │
└──────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIAL LOAD
━━━━━━━━━━━━━━━━━━━━━━━
User visits app
        │
        ▼
┌─────────────────────────────────────────┐
│ App.tsx initializes AuthProvider        │
│ Calls: initializeAuth()                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │ authService.getCurrentSession()  │
    │ (Supabase auth session check)    │
    └────────────┬─────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    (Session         (No Session)
     Found)               │
        │                 ▼
        │          Redirect to /auth
        │          (LoginPage)
        ▼
┌─────────────────────────────────────────┐
│ refreshUserData()                       │
│ Fetch from 'divers' table               │
│ Get: name, email, access_status, role  │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Check access_status:            │
    │  • pending ──► Waiting approval  │
    │  • approved ──► Full access      │
    │  • revoked ──► Access denied     │
    └─────────────┬───────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
   (pending)   (approved)  (revoked)
      │           │           │
      ▼           ▼           ▼
  Show        Continue    Access
  Pending     to app      Denied
  Notice


PHASE 2: LOGIN WITH PIN
━━━━━━━━━━━━━━━━━━━━━━━
User at LoginPage
        │
        ▼
┌─────────────────────────────────────────┐
│  PinLogin Component Displayed            │
│  ┌─────────────────────────────────────┐│
│  │ Email input                         ││
│  │ PIN input (6 digits)                ││
│  └─────────────────────────────────────┘│
└────────────┬────────────────────────────┘
             │
             ▼
    User enters credentials
             │
             ▼
┌─────────────────────────────────────────┐
│ authService.signInWithEmail(email, pin) │
│ Routes to PIN verification logic        │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ Query 'divers' table:              │
    │  WHERE email = provided_email      │
    │  AND access_status = 'approved'    │
    │  AND access_pin_hash IS NOT NULL   │
    └────────────┬───────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    (Found)            (Not Found)
        │                 │
        ▼                 ▼
    ┌──────────────┐  ┌────────────────┐
    │ Compare PIN: │  │ Return error:  │
    │ bcrypt.      │  │ "User not      │
    │ compare()    │  │  found or not  │
    │              │  │  approved"     │
    └────┬─────────┘  └────────────────┘
         │
    ┌────┴─────────┐
    │              │
(Match)        (No Match)
    │              │
    ▼              ▼
┌─────────────┐ ┌────────────────────┐
│ PIN Valid   │ │ Increment failure  │
│ Log: success│ │ counter + Log fail │
└────┬────────┘ └─────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│ Create Supabase Auth Session             │
│ Set JWT token in localStorage            │
│ Update: last_login = NOW()               │
│ Log activity: 'login_success'            │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ AuthContext updated with:                │
│  • user (from divers table)              │
│  • session (JWT)                         │
│  • role (admin/user)                     │
│  • isLoading = false                     │
└────────┬─────────────────────────────────┘
         │
         ▼
    Redirect to /dashboard
    (or requested page)


PHASE 3: ROLE-BASED ACCESS CONTROL (RBAC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When accessing protected routes:

Route Request: /admin
        │
        ▼
ProtectedRoute checks:
        │
        ├─ Is user authenticated?
        │  └─► Check: session exists? AuthContext.isLoading = false
        │
        ├─ Is access approved?
        │  └─► Check: access_status = 'approved'
        │      └─► Query audit log for confirmation
        │
        ├─ Is user an admin?
        │  └─► Check: is_pro = TRUE or role = 'admin'
        │      └─► Verify in divers table
        │
        └─ Route-specific role check
           └─► /admin: is_pro must be true
           └─► /dashboard: approved status needed
           └─► /checklist: any approved user

        │
    ┌───┴───────────┐
    │               │
 (All Checks   (Failed Check)
  Pass)            │
    │              ▼
    │       ┌────────────────┐
    │       │ Redirect to:   │
    │       │  /auth or      │
    │       │  /403-denied   │
    │       └────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ Render Protected Component   │
│ Full access to all features  │
│ Role-specific UI visible     │
└──────────────────────────────┘


SESSION MANAGEMENT
━━━━━━━━━━━━━━━━━
AuthProvider Listener:
        │
        └─► supabase.auth.onAuthStateChange()
            │
            ├─► SIGNED_IN
            │   └─► Load user profile, refresh data
            │
            ├─► SIGNED_OUT
            │   └─► Clear all state, redirect to /auth
            │
            └─► TOKEN_REFRESHED
                └─► Update session JWT


LOGOUT FLOW
━━━━━━━━━━
User clicks Logout
        │
        ▼
┌──────────────────────────────┐
│ signOut()                    │
│  • Call supabase.auth.signOut│
│  • Clear localStorage tokens │
│  • Log activity: 'logout'    │
│  • Clear AuthContext state   │
└────────┬─────────────────────┘
         │
         ▼
Redirect to /auth
(LoginPage displayed)
```

---

## 5. FILE STRUCTURE

### New Files Created and Project Organization

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        FILE STRUCTURE                                    │
│              (New Authentication & Admin System Files)                   │
└──────────────────────────────────────────────────────────────────────────┘

kvs-scuba-maldivi/
│
├── 📄 SYSTEM_ARCHITECTURE_DIAGRAM.md (THIS FILE)
│
├── 📁 src/
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📁 auth/
│   │   │   ├── 🔒 AuthPortal.tsx
│   │   │   │   ├─ OAuth redirect handling
│   │   │   │   ├─ Email verification UI
│   │   │   │   └─ Callback processing
│   │   │   │
│   │   │   └── 🔒 LoginPage.tsx
│   │   │       ├─ PIN entry form
│   │   │       ├─ Email lookup
│   │   │       └─ Error handling
│   │   │
│   │   ├── 📁 admin/
│   │   │   ├── 🔐 AdminDashboard.tsx
│   │   │   │   ├─ Admin control center
│   │   │   │   ├─ Tab navigation
│   │   │   │   └─ Role verification
│   │   │   │
│   │   │   ├── 📁 tabs/
│   │   │   │   ├─ 📊 Dashboard.tsx (Admin main view)
│   │   │   │   ├─ 👥 UserManagement.tsx (User list, edit)
│   │   │   │   ├─ 🛡️ AccessControl.tsx (Approve/revoke)
│   │   │   │   ├─ 📈 Analytics.tsx (Usage stats)
│   │   │   │   └─ ⚙️ Settings.tsx (System config)
│   │   │   │
│   │   │   └── 📄 index.ts (Exports)
│   │   │
│   │   ├── 📁 checklist/
│   │   │   └── 📝 ExpeditionChecklist.tsx
│   │   │       ├─ Packing list UI
│   │   │       ├─ Category organization
│   │   │       └─ Export/print functions
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├─ Header.tsx (Navigation bar)
│   │   │   ├─ Footer.tsx (Utility links)
│   │   │   └─ Navigation.tsx (Route links)
│   │   │
│   │   ├── 🔒 ProtectedRoute.tsx
│   │   │   ├─ Role-based access check
│   │   │   ├─ Status verification
│   │   │   └─ Redirect logic
│   │   │
│   │   ├── 🔒 AuthCallback.tsx
│   │   │   └─ OAuth callback handler
│   │   │
│   │   ├── 📱 MaldivesTripGuide.tsx (Main guide)
│   │   ├── 🎨 LanguageSwitcher.tsx (i18n toggle)
│   │   ├── 📊 Dashboard.tsx (Main dashboard)
│   │   ├── 📷 Gallery.tsx (Photo gallery)
│   │   ├── 👥 Participants.tsx (User list)
│   │   ├── 📋 Itinerary.tsx (Trip schedule)
│   │   ├── 🏝️ EssentialInfo.tsx (Maldives facts)
│   │   ├── 🛫 Preparation.tsx (Trip prep guide)
│   │   ├── 💬 ChatBot.tsx (AI assistant)
│   │   └── 🤖 SystemDiagnostics.tsx (Debug tool)
│   │
│   ├── 📁 contexts/
│   │   ├── 🔐 AuthContext.tsx
│   │   │   ├─ Global auth state
│   │   │   ├─ User, session, role, isLoading
│   │   │   ├─ useAuth() hook
│   │   │   └─ withAuth() HOC
│   │   │
│   │   └── 🔐 AuthProvider.tsx
│   │       ├─ Auth provider wrapper
│   │       ├─ Initializes session
│   │       └─ Listens to auth changes
│   │
│   ├── 📁 services/
│   │   ├── 🔐 authService.ts (Core auth logic)
│   │   │   ├─ signInWithEmail()
│   │   │   ├─ signInWithGoogle()
│   │   │   ├─ signUpForAccess()
│   │   │   ├─ getCurrentSession()
│   │   │   ├─ getUserRole()
│   │   │   ├─ refreshUserData()
│   │   │   ├─ logActivity()
│   │   │   └─ signOut()
│   │   │
│   │   ├── 📍 diveSitesService.ts (Dive location data)
│   │   ├── 🌐 geoapifyService.ts (Maps/geo API)
│   │   ├── 🗺️ overpassService.ts (OSM data)
│   │   └── 🤖 genaiService.ts (Google GenAI integration)
│   │
│   ├── 📁 data/
│   │   └── 📋 maldives-trip.json (Static trip data)
│   │
│   ├── 📁 locales/
│   │   ├── 🇬🇧 en.json (English translations)
│   │   └── 🇧🇦 bs.json (Bosnian translations)
│   │
│   ├── 📄 i18n.ts (i18n configuration)
│   ├── 📄 constants.tsx (App constants)
│   ├── 📄 index.tsx (React entry point)
│   └── 📄 App.tsx (Main app component)
│
├── 📁 public/
│   └── 📄 index.html (HTML shell)
│
├── 📁 database/
│   ├── 📄 supabase_migration_auth_system.sql
│   │   ├─ CREATE TABLE divers
│   │   ├─ CREATE TABLE access_requests
│   │   ├─ CREATE TABLE admin_audit_log
│   │   ├─ CREATE TABLE activity_logs
│   │   └─ RLS policies
│   │
│   ├── 📄 supabase_migration_fresh.sql
│   │   ├─ CREATE TABLE payments
│   │   ├─ CREATE TABLE itinerary
│   │   ├─ CREATE TABLE gallery
│   │   └─ Initial data
│   │
│   └── 📄 DATABASE_CLEANUP.sql
│       └─ Data maintenance scripts
│
├── 📁 config/
│   ├── 📄 vite.config.ts (Vite build config)
│   ├── 📄 tsconfig.json (TypeScript config)
│   ├── 📄 tailwind.config.js (Tailwind CSS)
│   └── 📄 postcss.config.js (PostCSS config)
│
├── 📄 package.json
│   ├─ Dependencies: React, Supabase, i18next
│   └─ Dev dependencies: Vite, TypeScript, Tailwind
│
├── 📄 .env.local (Local environment variables)
│   ├─ VITE_SUPABASE_URL
│   ├─ VITE_SUPABASE_ANON_KEY
│   └─ VITE_GOOGLE_GENAI_KEY
│
├── 📄 docker-compose.yml (Docker setup)
├── 📄 Dockerfile (Container image)
│
└── 📁 documentation/
    ├── 📄 ADMIN_MANUAL.md
    ├── 📄 DEPLOYMENT_README.md
    ├── 📄 ARCHITECTURE.md
    └── 📄 API_REFERENCE.md


KEY DIRECTORIES EXPLAINED
━━━━━━━━━━━━━━━━━━━━━━━━

src/components/
  └─ React UI components
     ├─ auth/ ............... Login/signup UI
     ├─ admin/ .............. Admin control panel
     ├─ checklist/ .......... Packing lists
     └─ layout/ ............. Page structure

src/services/
  └─ API & business logic
     ├─ authService.ts ...... Authentication
     ├─ diveSitesService.ts . Location data
     └─ geoapifyService.ts .. Mapping API

src/contexts/
  └─ React Context API
     └─ AuthContext.tsx ..... Global auth state

src/data/
  └─ Static JSON data
     └─ maldives-trip.json .. Trip information

database/
  └─ SQL migrations
     ├─ Create tables
     ├─ Define RLS policies
     └─ Seed initial data


ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━

.env.local
──────────
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_GENAI_KEY=your-gemini-api-key
VITE_APP_NAME=KVS-Scuba Maldives 2026
VITE_APP_VERSION=1.0.0
NODE_ENV=development


BUILD & DEPLOYMENT
━━━━━━━━━━━━━━━━

npm scripts (package.json):
──────────────────────────
  npm run dev ........... Start dev server (Vite)
  npm run build ......... Production build
  npm run preview ....... Preview built app
  npm run lint .......... TypeScript check
  npm run type-check .... Full type validation


Docker:
───────
  docker-compose up .... Run containerized app
  docker build -t app . Build image
  docker run -p 3000:3000 app .. Run container
```

---

## 6. QUICK REFERENCE SUMMARY

### Key Components & Their Roles

| Component | Location | Purpose |
|-----------|----------|---------|
| **AuthProvider** | `src/contexts/AuthProvider.tsx` | Global auth state management |
| **AuthContext** | `src/contexts/AuthContext.tsx` | Auth state & hooks (useAuth()) |
| **ProtectedRoute** | `src/components/ProtectedRoute.tsx` | Role-based access control wrapper |
| **LoginPage** | `src/components/auth/LoginPage.tsx` | PIN-based login form |
| **AuthPortal** | `src/components/auth/AuthPortal.tsx` | OAuth & email signup |
| **AdminDashboard** | `src/components/admin/AdminDashboard.tsx` | Admin control center |
| **UserManagement** | `src/components/admin/tabs/UserManagement.tsx` | User list & approval interface |
| **authService** | `src/services/authService.ts` | Authentication API calls |

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **divers** | User accounts | id, email, access_pin_hash, access_status, is_pro |
| **access_requests** | Approval history | diver_id, request_status, approved_by_id, approved_at |
| **admin_audit_log** | Admin actions | admin_id, action, target_user_id, details |
| **activity_logs** | User activity | user_id, activity_type, timestamp, ip_address |
| **payments** | Trip payments | diver_id, amount, status, payment_date |

### User Roles

| Role | Access Level | Can Do |
|------|--------------|--------|
| **Anonymous** | None | View public pages only |
| **Pending** | Limited | Dashboard read-only, awaiting approval |
| **Approved** | Full | All features, use PIN to login |
| **Admin** (is_pro=true) | Full+Control | Everything + approve users, view audit logs |

### Key Status Values

```
access_status enum:
  • 'pending'  - Awaiting admin review
  • 'approved' - Full access granted
  • 'revoked'  - Access previously granted then revoked

activity_type examples:
  • 'login_success'    - User logged in
  • 'login_failed'     - Failed login attempt
  • 'signup_completed' - New account created
  • 'access_requested' - User requested approval
  • 'access_approved'  - Admin approved access
  • 'session_start'    - Session began
  • 'session_end'      - Session ended
```

---

## 7. DEPLOYMENT CHECKLIST

```
PRE-DEPLOYMENT
━━━━━━━━━━━━━━
☐ Environment variables configured (.env.local)
☐ Supabase project created and URL/keys set
☐ Database migrations executed (supabase_migration_auth_system.sql)
☐ RLS policies verified on all tables
☐ Admin users manually pre-approved in 'divers' table
☐ Activity logging table indexed for performance
☐ Email verification configured in Supabase
☐ OAuth providers (Google) configured if needed

TESTING
━━━━━
☐ Login flow tested (PIN verification)
☐ Role checks verified (admin vs. user)
☐ Protected routes tested (redirect on unauth)
☐ Activity logging verified
☐ Approval workflow tested
☐ Audit log captures admin actions
☐ Session management tested (logout, expiry)

PRODUCTION
━━━━━━━━━
☐ npm run build (creates optimized dist/)
☐ Environment variables set for production
☐ Database backups configured
☐ Error monitoring enabled (Sentry, etc.)
☐ Rate limiting configured on auth endpoints
☐ HTTPS enforced
☐ CORS settings configured
☐ Monitoring alerts set up
```

---

## 8. KEY ARCHITECTURAL PRINCIPLES

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   SYSTEM DESIGN PRINCIPLES                               │
└──────────────────────────────────────────────────────────────────────────┘

1. SEPARATION OF CONCERNS
   ├─ Components (UI) ────────► Isolated, reusable
   ├─ Services (Logic) ───────► Centralized API calls
   ├─ Context (State) ────────► Global auth management
   └─ Database (Data) ────────► Single source of truth

2. SECURITY FIRST
   ├─ Row-Level Security (RLS) on all tables
   ├─ Password hashing with bcrypt
   ├─ PIN encryption (access_pin_hash)
   ├─ JWT tokens via Supabase Auth
   ├─ Activity audit logging
   └─ Rate limiting on sensitive endpoints

3. ROLE-BASED ACCESS CONTROL (RBAC)
   ├─ Access status enum (pending/approved/revoked)
   ├─ Admin flag (is_pro) for elevated permissions
   ├─ ProtectedRoute wrapper for routes
   └─ Component-level permission checks

4. AUDIT & COMPLIANCE
   ├─ All admin actions logged (admin_audit_log)
   ├─ User activity tracked (activity_logs)
   ├─ Access request history (access_requests)
   ├─ Timestamps on all critical events
   └─ IP address & user agent captured

5. SCALABILITY
   ├─ Database indexes on lookup columns
   ├─ Pagination for large datasets
   ├─ Lazy loading of components
   ├─ Caching of static data
   └─ Asynchronous operations (async/await)

6. INTERNATIONALIZATION (i18n)
   ├─ Multi-language support (English, Bosnian)
   ├─ Translation files in src/locales/
   ├─ Dynamic language switching
   └─ Locale-specific formatting

7. ERROR HANDLING
   ├─ Try-catch blocks around API calls
   ├─ User-friendly error messages
   ├─ Detailed logging for debugging
   └─ Graceful fallbacks

8. TESTING READINESS
   ├─ Type safety via TypeScript
   ├─ Service layer for easy mocking
   ├─ Clear component contracts
   └─ Diagnostic tools included
```

---

**Document Version**: 1.0  
**Last Updated**: December 24, 2025  
**System**: KVS-Scuba Maldives 2026  
**Framework**: React + Vite + Supabase + TypeScript
