# KVS Scuba Maldives - Phase 1-4 Implementation Guide

**Document Status:** Complete Implementation Guide  
**Last Updated:** December 24, 2025  
**Target Deployment:** Lovable Platform

---

## 1. Executive Summary

### What Has Been Created

This project implements a comprehensive scuba diving expedition management system with the following components:

- **Phase 1:** Complete database schema with RLS policies for secure data access
- **Phase 2:** Authentication system with Google OAuth and role-based access control
- **Phase 3:** Admin dashboard for approving divers and managing expeditions
- **Phase 4:** User interface for divers to view and manage expeditions with persistent checklists

### Current Status

✅ **All components are built and ready for integration**
- Database schema files prepared
- Authentication service layer created
- Admin dashboard fully implemented
- User checklist interface implemented
- All files optimized for Lovable deployment

### Next Steps

1. Execute Phase 1 database setup (SQL execution)
2. Complete Phase 2 authentication integration
3. Integrate Phase 3 admin components
4. Connect Phase 4 user interface
5. Run full system testing
6. Deploy to Lovable platform

---

## 2. Phase 1: Database Setup (EXECUTE FIRST)

> **⚠️ IMPORTANT:** Database setup must be completed before any other phases. This creates the foundation for all other systems.

### Step 1: Access Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Log in to your Maldives project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Execute PHASE1_DATABASE_SCHEMA.sql

1. Open `PHASE1_DATABASE_SCHEMA.sql` from the project root
2. Copy the entire SQL content
3. Paste into the Supabase SQL Editor query window
4. Click **Run** button (or press `Ctrl+Enter`)
5. Verify that the script completes without errors

**What This Creates:**
- `profiles` table - User profiles with roles
- `expeditions` table - Expedition information and scheduling
- `user_expeditions` table - User-expedition relationships
- `expedition_checklists` table - Individual checklist items per diver
- `checklist_items` table - Predefined checklist templates
- `admin_approvals` table - Approval workflow tracking

**Verification Queries:**

Run these queries in order to confirm all tables exist:

```sql
-- Check profiles table
SELECT * FROM profiles LIMIT 1;

-- Check expeditions table
SELECT * FROM expeditions LIMIT 1;

-- Check user_expeditions table
SELECT * FROM user_expeditions LIMIT 1;

-- Check expedition_checklists table
SELECT * FROM expedition_checklists LIMIT 1;

-- Check checklist_items table
SELECT * FROM checklist_items LIMIT 1;

-- Check admin_approvals table
SELECT * FROM admin_approvals LIMIT 1;

-- View all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result:** All tables should exist with no errors.

### Step 3: Execute PHASE1_RLS_POLICIES.sql

Once verification queries pass:

1. Open `PHASE1_RLS_POLICIES.sql` from the project root
2. Copy the entire SQL content
3. Paste into a **new query** in Supabase SQL Editor
4. Click **Run**
5. Verify completion

**What This Creates:**
- Row Level Security policies for `profiles` table
- RLS for `expeditions` table (read-only for authenticated users)
- RLS for `user_expeditions` (users can only see their own)
- RLS for `expedition_checklists` (users can only see/edit their own)
- RLS for `admin_approvals` (only admins can approve/reject)

**Verification Queries:**

```sql
-- Check RLS is enabled on profiles
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'expeditions', 'user_expeditions', 
                     'expedition_checklists', 'admin_approvals')
ORDER BY tablename;

-- Expected output: rowsecurity should be 't' (true) for all tables

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename IN ('profiles', 'expeditions', 'user_expeditions',
                     'expedition_checklists', 'admin_approvals')
ORDER BY tablename, policyname;
```

**Expected Result:** All tables should have RLS enabled with appropriate policies.

### Step 4: Initialize Default Data (Optional but Recommended)

Create a new query with sample expeditions:

```sql
-- Insert sample expeditions
INSERT INTO expeditions (name, location, date_start, date_end, description, difficulty_level, max_participants)
VALUES 
  ('Maldives Grand Atoll Tour', 'North Malé Atoll', '2025-02-01', '2025-02-08', 'Comprehensive atoll exploration', 'Intermediate', 12),
  ('Wreck Diving Adventure', 'Vaavu Atoll', '2025-03-15', '2025-03-22', 'Explore multiple wreck sites', 'Advanced', 8),
  ('Coral Reef Photography', 'Ari Atoll', '2025-04-10', '2025-04-17', 'Macro and wide-angle reef photography', 'Beginner', 10),
  ('Mantra Dive Trip', 'Meemu Atoll', '2025-05-05', '2025-05-12', 'Pelagic species and big fish', 'Intermediate', 10);

-- Verify inserted data
SELECT id, name, location, date_start, date_end FROM expeditions ORDER BY date_start;
```

---

## 3. Phase 2: Authentication Setup

### Files Created

| File | Purpose |
|------|---------|
| `src/services/authService.ts` | Authentication API calls and token management |
| `src/contexts/AuthContext.tsx` | Global authentication state management |
| `src/components/auth/AuthPortal.tsx` | Login/signup UI component |
| `src/components/auth/ProtectedRoute.tsx` | Route protection wrapper |

### 3.1: Environment Variables Setup

Add these to your `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Where to Get These Values:**

1. **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY:**
   - Go to Supabase Dashboard > Settings > API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon key" → `VITE_SUPABASE_ANON_KEY`

2. **VITE_GOOGLE_CLIENT_ID:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials (Web Application)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (development)
     - `http://localhost:3000` (production local)
     - Your deployed Lovable URL
   - Copy the Client ID

### 3.2: Set Up Google OAuth in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Find "Google" and click to enable
3. Enter:
   - **Client ID:** Your Google OAuth Client ID
   - **Client Secret:** Your Google OAuth Client Secret
4. Click **Save**
5. Go to Authentication > URL Configuration
6. Add your production URL under "Site URL"

### 3.3: Integrate AuthContext into App.tsx

In `App.tsx`, wrap your entire app with AuthProvider:

```tsx
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthPortal from './components/auth/AuthPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import UserMenu from './components/user/UserMenu';
import ExpeditionChecklist from './components/checklist/ExpeditionChecklist';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPortal />} />
          
          {/* Protected routes */}
          <Route 
            path="/admin/*" 
            element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/user/*" 
            element={<ProtectedRoute requiredRole="diver"><UserMenu /></ProtectedRoute>} 
          />
          <Route 
            path="/expeditions/:id/checklist" 
            element={<ProtectedRoute requiredRole="diver"><ExpeditionChecklist /></ProtectedRoute>} 
          />
          
          {/* Default route */}
          <Route path="/" element={<AuthPortal />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### 3.4: Authentication Flow

**User Registration:**
1. User clicks "Sign up with Google"
2. Google OAuth popup appears
3. System creates/updates profile in `profiles` table with role "diver"
4. AuthContext stores user session
5. User is redirected to waiting screen (pending admin approval)

**User Login:**
1. User clicks "Login with Google"
2. System verifies user exists in `profiles` table
3. Checks approval status in `admin_approvals` table
4. If approved and admin: routes to Admin Dashboard
5. If approved and diver: routes to User Menu
6. If pending: shows "Awaiting approval" message

**Authentication Service Methods:**

```typescript
// Login with Google
signInWithGoogle(): Promise<Session>

// Logout
signOut(): Promise<void>

// Get current user
getCurrentUser(): Promise<User | null>

// Update user profile
updateProfile(data: ProfileUpdate): Promise<void>

// Check if user is approved
isUserApproved(userId: string): Promise<boolean>

// Get user role
getUserRole(userId: string): Promise<'admin' | 'diver' | null>
```

### 3.5: Testing Authentication

1. **Test User Registration:**
   - Go to `http://localhost:5173/auth`
   - Click "Sign up with Google"
   - Complete Google login
   - Verify profile appears in Supabase `profiles` table
   - Check role is set to "diver"

2. **Test User Login:**
   - Sign out (if signed in)
   - Click "Login with Google"
   - Verify you're logged in

3. **Test Route Protection:**
   - While logged in as diver, try accessing `/admin`
   - Should redirect to `/auth`
   - Try accessing `/user` - should load User Menu

4. **Test Admin Status:**
   - Update a user's role to "admin" in Supabase (profiles table)
   - Sign out and log back in
   - Should now be able to access `/admin`

---

## 4. Phase 3: Admin System Setup

### Files Created

| File | Purpose |
|------|---------|
| `src/components/admin/AdminDashboard.tsx` | Main admin interface |
| `src/components/admin/DiveApprovals.tsx` | Approve/reject pending divers |
| `src/components/admin/ExpeditionManager.tsx` | Create/edit expeditions |
| `src/components/admin/UserManagement.tsx` | Manage user roles and permissions |
| `src/components/admin/ReportsAndAnalytics.tsx` | View expedition statistics |
| `src/components/admin/SystemSettings.tsx` | Configure system parameters |

### 4.1: Integration into App.tsx

The admin routes should already be set up from Phase 2, but verify:

```tsx
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### 4.2: Admin Dashboard Features

**DiveApprovals Component:**
- Lists all pending diver approvals
- Shows user details (name, email, certification level)
- Buttons to "Approve" or "Reject"
- Updates `admin_approvals` table
- Sends notification emails (if configured)

**ExpeditionManager Component:**
- View all expeditions
- Create new expeditions
- Edit expedition details
- Delete expeditions
- Set difficulty level and max participants
- Schedule future expeditions

**UserManagement Component:**
- View all registered users
- Filter by role (admin, diver)
- Search by name or email
- Change user roles
- View approval status
- Delete users if needed

**ReportsAndAnalytics Component:**
- Total registered divers
- Expeditions completed/upcoming
- Diver participation statistics
- Certification level breakdown
- Monthly registration trends

**SystemSettings Component:**
- Configure max divers per expedition
- Set minimum certification requirements
- Email notification settings
- Theme and language preferences
- Database maintenance options

### 4.3: Testing Admin Dashboard

1. **Create Admin User:**
   - Register a new user via Google OAuth
   - In Supabase (profiles table), change their role to "admin"
   - Set their approval status to "approved"

2. **Test Access:**
   - Log in as the admin user
   - Navigate to `http://localhost:5173/admin`
   - Should see AdminDashboard with all sub-sections

3. **Test DiveApprovals:**
   - Register another user as "diver"
   - In admin dashboard, go to "Dive Approvals"
   - Should see the pending diver
   - Click "Approve" and verify status updates in database

4. **Test ExpeditionManager:**
   - Create a new expedition
   - Verify it appears in the expeditions table
   - Edit an expedition
   - Verify changes are saved

5. **Test UserManagement:**
   - View all users
   - Change a user's role
   - Verify changes in the profiles table

---

## 5. Phase 4: User Interface

### Files Created

| File | Purpose |
|------|---------|
| `src/components/user/UserMenu.tsx` | Main user interface and menu |
| `src/components/checklist/ExpeditionChecklist.tsx` | Expedition-specific checklist |
| `src/components/common/Header.tsx` | App header with navigation |
| `src/components/common/ThemeToggle.tsx` | Dark/light mode switching |
| `src/components/common/LanguageSelector.tsx` | Multi-language support (EN/HR) |

### 5.1: Integration into App Header

Update your main `Header.tsx` component:

```tsx
import UserMenu from './user/UserMenu';
import ThemeToggle from './common/ThemeToggle';
import LanguageSelector from './common/LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-white dark:bg-slate-900 shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">KVS Scuba Maldives</h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
            <UserMenu user={user} onSignOut={signOut} />
          </div>
        )}
      </div>
    </header>
  );
}
```

### 5.2: User Menu Features

**Main Menu Options:**
- Dashboard / My Expeditions
- Expedition Details
- Personal Checklist
- Certification Management
- User Profile & Settings
- Sign Out

**My Expeditions View:**
- List of all approved expeditions user is registered for
- Expedition cards showing:
  - Location
  - Dates
  - Difficulty level
  - Max depth
  - Status (upcoming, ongoing, completed)
- Filter by status
- Search by location

**Expedition Checklist:**
- Pre-dive safety checklist
- Equipment checklist
- Buddy assignments
- Check off items as completed
- Save progress automatically
- Print checklist if needed

### 5.3: ExpeditionChecklist Component

The checklist is expedition and user-specific:

**Features:**
- Loads checklist items from `expedition_checklists` table
- Grouped by category (equipment, safety, briefing, etc.)
- Checkboxes for each item
- Notes field for each item
- Auto-save to database (debounced)
- Timestamp of last modification
- Status indicator (not started, in progress, complete)

**Data Flow:**
1. User selects expedition
2. Component loads user's specific checklist from database
3. Displays pre-populated items
4. User checks off completed items
5. Changes auto-save to `expedition_checklists` table
6. Checklist persists across sessions

**Code Integration:**

```tsx
import ExpeditionChecklist from './components/checklist/ExpeditionChecklist';

<Route 
  path="/expeditions/:expeditionId/checklist" 
  element={
    <ProtectedRoute requiredRole="diver">
      <ExpeditionChecklist />
    </ProtectedRoute>
  } 
/>
```

### 5.4: Data Persistence

**Automatic Save:**
- All checklist changes are auto-saved to database
- 500ms debounce to reduce database calls
- Visual feedback (saving... → saved ✓)
- Sync status indicator

**Local Storage (Backup):**
- Checklist state also stored in browser localStorage
- Used for offline viewing (if internet drops)
- Auto-syncs when connection restored

**Database Storage:**
- Primary storage in `expedition_checklists` table
- `user_id` + `expedition_id` creates unique checklist per diver per expedition
- `completed_items` JSON array stores checked items
- `notes` field for item-specific notes

---

## 6. File Structure Summary

### Directory Organization

```
kvs-scuba-maldivi/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx        # Main admin interface
│   │   │   ├── DiveApprovals.tsx         # Approve divers
│   │   │   ├── ExpeditionManager.tsx     # Manage expeditions
│   │   │   ├── UserManagement.tsx        # Manage users
│   │   │   ├── ReportsAndAnalytics.tsx   # Analytics
│   │   │   └── SystemSettings.tsx        # System config
│   │   ├── auth/
│   │   │   ├── AuthPortal.tsx            # Login/signup UI
│   │   │   └── ProtectedRoute.tsx        # Route protection
│   │   ├── user/
│   │   │   └── UserMenu.tsx              # User dashboard
│   │   ├── checklist/
│   │   │   └── ExpeditionChecklist.tsx   # Checklist UI
│   │   └── common/
│   │       ├── Header.tsx                # App header
│   │       ├── ThemeToggle.tsx           # Dark mode
│   │       └── LanguageSelector.tsx      # i18n selector
│   ├── contexts/
│   │   └── AuthContext.tsx               # Auth state
│   ├── services/
│   │   └── authService.ts                # Auth API
│   ├── hooks/
│   │   └── useAuth.ts                    # Auth hook
│   ├── types/
│   │   └── index.ts                      # TypeScript types
│   ├── App.tsx                           # Main app
│   ├── index.tsx                         # Entry point
│   └── styles/                           # CSS/Tailwind
├── public/
│   └── index.html
├── PHASE1_DATABASE_SCHEMA.sql            # Database setup
├── PHASE1_RLS_POLICIES.sql               # Security policies
└── package.json                          # Dependencies
```

### New Files Reference

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| authService.ts | Service | ~200 | Authentication API integration |
| AuthContext.tsx | Context | ~150 | Global auth state |
| AuthPortal.tsx | Component | ~300 | Login/signup UI |
| ProtectedRoute.tsx | Component | ~50 | Route protection wrapper |
| AdminDashboard.tsx | Component | ~200 | Admin interface |
| DiveApprovals.tsx | Component | ~250 | Approve divers |
| ExpeditionManager.tsx | Component | ~300 | Expedition CRUD |
| UserManagement.tsx | Component | ~280 | User management |
| ReportsAndAnalytics.tsx | Component | ~200 | Statistics view |
| SystemSettings.tsx | Component | ~150 | System configuration |
| UserMenu.tsx | Component | ~250 | User dashboard |
| ExpeditionChecklist.tsx | Component | ~350 | Checklist interface |
| Header.tsx | Component | ~80 | App header |
| ThemeToggle.tsx | Component | ~40 | Dark mode toggle |
| LanguageSelector.tsx | Component | ~60 | Language switcher |

---

## 7. Integration Checklist

Follow these steps in order to fully integrate all components:

### ✅ Phase 1: Database
- [ ] Run PHASE1_DATABASE_SCHEMA.sql in Supabase
- [ ] Verify all tables created with verification queries
- [ ] Run PHASE1_RLS_POLICIES.sql in Supabase
- [ ] Verify RLS policies are enabled
- [ ] (Optional) Insert sample expeditions

### ✅ Phase 2: Authentication
- [ ] Set up `.env.local` with Supabase credentials
- [ ] Configure Google OAuth in Supabase
- [ ] Set up Google Cloud OAuth credentials
- [ ] Update `App.tsx` with AuthProvider wrapper
- [ ] Add authentication routes to `App.tsx`
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test route protection

### ✅ Phase 3: Admin System
- [ ] Verify AdminDashboard route in `App.tsx`
- [ ] Create test admin user
- [ ] Access admin dashboard
- [ ] Test DiveApprovals component
- [ ] Test ExpeditionManager component
- [ ] Test UserManagement component
- [ ] Test ReportsAndAnalytics
- [ ] Test SystemSettings

### ✅ Phase 4: User Interface
- [ ] Update Header with user controls
- [ ] Integrate UserMenu component
- [ ] Add checklist route to `App.tsx`
- [ ] Test expedition list loading
- [ ] Test checklist UI and auto-save
- [ ] Test theme toggle
- [ ] Test language selector
- [ ] Verify localStorage persistence

### ✅ Final Steps
- [ ] Run npm run build (check for errors)
- [ ] Clear browser cache and localStorage
- [ ] Full end-to-end testing
- [ ] Deploy to Lovable platform
- [ ] Test on mobile devices
- [ ] Get user feedback

---

## 8. Environment Variables

### Required Environment Variables

Create `.env.local` in project root:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

# Optional: Application Settings
VITE_APP_NAME=KVS Scuba Maldives
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000
```

### Getting Each Value

**VITE_SUPABASE_URL:**
1. Supabase Dashboard
2. Settings → API
3. Project URL
4. Example: `https://abcdefghijk.supabase.co`

**VITE_SUPABASE_ANON_KEY:**
1. Supabase Dashboard
2. Settings → API
3. anon public key (not the service role key!)
4. Starts with `eyJ...`

**VITE_GOOGLE_CLIENT_ID:**
1. [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Web Application
3. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - Your Lovable deployment URL
4. Client ID is a long number followed by `.apps.googleusercontent.com`

### .env.local in Development

- **Location:** Project root directory
- **Never commit to git** (add to .gitignore)
- **Reload required:** Development server needs restart after changes
- **Visibility:** Only accessible from your machine

### Environment Variables in Lovable

When deploying to Lovable:

1. Go to Lovable platform settings
2. Add the same environment variables
3. Lovable uses `VITE_` prefix for client-side variables
4. Server-side variables use other prefixes (if needed)
5. Test after adding variables

---

## 9. Testing Protocol

### Test Case 1: New User Registration

**Objective:** Verify new users can register via Google OAuth

**Steps:**
1. Go to `http://localhost:5173/auth`
2. Click "Sign up with Google"
3. Select Google account (use test account if available)
4. Complete OAuth flow
5. Verify redirect to waiting screen

**Verification:**
- [ ] Check `profiles` table in Supabase
- [ ] New user exists with role = "diver"
- [ ] Email matches Google account
- [ ] Created timestamp is recent

**Expected:** User appears in database with pending approval status

---

### Test Case 2: Admin Approval Flow

**Objective:** Verify admin can approve pending divers

**Steps:**
1. Log in as admin user (already set up in Phase 3)
2. Go to `/admin/approvals`
3. See list of pending divers
4. Click "Approve" for a pending diver
5. Verify user is removed from pending list

**Verification:**
- [ ] Check `admin_approvals` table
- [ ] Approval record shows "approved" status
- [ ] Timestamp is updated
- [ ] Approved user can now log in

**Expected:** Diver approval is recorded and user gains access

---

### Test Case 3: Checklist Persistence

**Objective:** Verify checklist changes are saved and persist

**Steps:**
1. Log in as approved diver
2. Select an expedition
3. Go to expedition checklist
4. Check off 3-4 items
5. Refresh browser (F5)
6. Navigate back to same checklist

**Verification:**
- [ ] Checked items remain checked after refresh
- [ ] Completion percentage is updated
- [ ] Database shows all checked items
- [ ] Local storage has backup copy

**Expected:** Changes persist across sessions

**Test Case 3B: Offline Access**
1. Complete Test Case 3 steps 1-4
2. Go to browser DevTools → Network → Offline
3. Check/uncheck more items
4. Verify UI updates
5. Go online (toggle Offline)
6. Verify sync to database

**Expected:** Works offline, syncs when online

---

### Test Case 4: Theme and Language Switching

**Objective:** Verify theme and language persistence

**Steps:**
1. Log in as any user
2. Click theme toggle (sun/moon icon)
3. Verify app switches to dark/light mode
4. Refresh browser
5. Verify theme persists
6. Click language selector
7. Switch from English to Croatian
8. Verify UI text changes
9. Refresh browser
10. Verify language persists

**Verification:**
- [ ] Theme toggle works
- [ ] Persists in localStorage
- [ ] Language selector works
- [ ] Translations appear correctly
- [ ] Both persist after refresh

**Expected:** Theme and language preferences are remembered

---

### Test Case 5: Admin Dashboard Functions

**Objective:** Verify all admin dashboard features

**Test 5A: ExpeditionManager**
1. Go to `/admin/expeditions`
2. Click "Create Expedition"
3. Fill in expedition details
4. Click "Save"
5. Verify it appears in list
6. Click "Edit"
7. Change a detail
8. Save and verify

**Test 5B: UserManagement**
1. Go to `/admin/users`
2. Search for a user
3. View user details
4. Change user role
5. Verify change in database

**Test 5C: Analytics**
1. Go to `/admin/analytics`
2. View dashboard statistics
3. Check numbers match database
4. View monthly trends

**Expected:** All features work without errors

---

### Test Case 6: Security - Route Protection

**Objective:** Verify unapproved users cannot access protected routes

**Steps:**
1. Create new user account (registers as diver, pending approval)
2. Try to access `/admin` → should redirect to `/auth`
3. Try to access `/expeditions/1/checklist` → should redirect to `/auth`
4. Try to access `/user` → should redirect to `/auth`
5. Admin approves the user
6. Log out and log back in
7. Should now be able to access `/expeditions/1/checklist`

**Expected:** Unapproved users redirected, approved users can access

---

## 10. Troubleshooting

### Common Issues and Solutions

#### Issue: "VITE_SUPABASE_URL is undefined"

**Cause:** Environment variables not loaded

**Solutions:**
1. Check `.env.local` exists in project root
2. Verify file has correct variable names
3. Stop development server
4. Run `npm install` to refresh environment
5. Start development server again
6. Check browser console for errors

---

#### Issue: "User registration fails with OAuth error"

**Cause:** Google OAuth not properly configured

**Solutions:**
1. Verify VITE_GOOGLE_CLIENT_ID in `.env.local`
2. Check Google Cloud Console:
   - OAuth app exists and is enabled
   - Authorized redirect URIs include `http://localhost:5173`
3. Verify Supabase has Google provider enabled
4. Check Supabase Settings → Authentication → Providers → Google
5. In Google OAuth credential, verify it's "Web Application" type
6. Clear browser cache and localStorage
7. Try again

---

#### Issue: "Authentication works but tables not found"

**Cause:** PHASE1 database setup not completed

**Solutions:**
1. Go to Supabase SQL Editor
2. Verify tables exist: Run `SELECT * FROM profiles LIMIT 1;`
3. If error, execute PHASE1_DATABASE_SCHEMA.sql
4. Run verification queries
5. Then execute PHASE1_RLS_POLICIES.sql
6. Verify RLS is enabled
7. Retry login

---

#### Issue: "Admin dashboard shows blank or errors"

**Cause:** User doesn't have admin role or not approved

**Solutions:**
1. Verify user is approved: Check `admin_approvals` table
2. Verify user role is "admin": Check `profiles` table
3. Clear browser cache and localStorage
4. Log out and log back in
5. Check browser console for JavaScript errors
6. Run build: `npm run build`
7. Check for any TypeScript errors

---

#### Issue: "Checklist changes not saving"

**Cause:** Database permissions or network issue

**Solutions:**
1. Open browser DevTools → Network tab
2. Make a checklist change
3. Look for failed requests
4. Check HTTP status codes
5. Verify RLS policies allow user to update:
   ```sql
   SELECT * FROM expedition_checklists WHERE user_id = 'your-user-id';
   ```
6. Check user_id in auth context matches database
7. Verify expedition_checklists RLS policy:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'expedition_checklists';
   ```

---

#### Issue: "Lovable deployment fails"

**Cause:** Environment variables or build errors

**Solutions:**
1. Run `npm run build` locally - should complete with no errors
2. Fix any build errors before deploying
3. In Lovable dashboard, verify all env variables are set
4. Check Lovable build logs for errors
5. Verify `.env.local` variables match Lovable settings
6. Clear Lovable cache and rebuild
7. Check Lovable documentation for deployment requirements

---

#### Issue: "Theme toggle or language selector not working"

**Cause:** localStorage or state management issue

**Solutions:**
1. Open DevTools → Application → localStorage
2. Verify `theme` and `language` keys are present
3. Check their values (should be "light"/"dark" and "en"/"hr")
4. Try clearing localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
5. Verify CSS classes are applied to root element:
   ```html
   <html class="dark"> <!-- for dark mode -->
   ```
6. Check Tailwind dark mode config in `tailwind.config.js`

---

### Verification Queries

Use these SQL queries to verify each component:

**Verify Authentication:**
```sql
-- Check user exists
SELECT id, email, role, created_at FROM profiles 
WHERE email = 'user@example.com';

-- Check approval status
SELECT * FROM admin_approvals 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC LIMIT 1;
```

**Verify Expeditions:**
```sql
-- List all expeditions
SELECT id, name, location, date_start, date_end, difficulty_level 
FROM expeditions 
ORDER BY date_start;

-- Check user-expedition relationships
SELECT * FROM user_expeditions 
WHERE user_id = 'user-uuid';
```

**Verify Checklists:**
```sql
-- Get user's checklist for expedition
SELECT * FROM expedition_checklists 
WHERE user_id = 'user-uuid' AND expedition_id = 'expedition-uuid';

-- Get all checklist templates
SELECT * FROM checklist_items;
```

**Verify RLS is Working:**
```sql
-- Current user should see only their data
SELECT * FROM expedition_checklists LIMIT 1;
-- If no results, RLS is working correctly (user has no checklists)

-- Admin should see all data
-- (Run as admin user in Supabase dashboard)
SELECT COUNT(*) FROM expedition_checklists;
```

---

## Quick Start Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting/type checking
npm run type-check

# Format code
npm run format
```

---

## Deployment to Lovable

1. **Prepare code:**
   - `npm run build` (verify no errors)
   - Clear git of any uncommitted changes
   - Verify all tests pass

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Phase 1-4 implementation complete"
   git push origin main
   ```

3. **In Lovable Platform:**
   - Click "Create New Project"
   - Connect GitHub repository
   - Select main branch
   - Add environment variables
   - Click "Deploy"

4. **Post-Deployment:**
   - Test login with Google OAuth
   - Verify database connection
   - Test all main features
   - Check mobile responsiveness

---

## Support and Next Steps

### If You Encounter Issues
1. Check the Troubleshooting section (Section 10)
2. Review relevant phase setup steps
3. Check browser console for errors
4. Check Supabase dashboard for data

### Next Implementation Phases
- **Phase 5:** Email notifications for approvals
- **Phase 6:** Advanced analytics and reporting
- **Phase 7:** Mobile app (React Native)
- **Phase 8:** Offline sync improvements

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Lovable Platform Docs](https://lovable.dev/docs)

---

**Document Complete**  
**All sections and implementation details provided**  
**Ready for immediate deployment**
