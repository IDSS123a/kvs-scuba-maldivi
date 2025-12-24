# PHASE 3.1: Google OAuth Setup - Complete Guide

**Status:** Setup Instructions + Code Ready  
**Time Required:** 20 minutes for OAuth setup + 10 minutes for code integration  
**Difficulty:** Intermediate

---

## 📋 Step 1: Create Google Cloud Project & OAuth Credentials

### 1.1 Create Google Cloud Project

1. **Go to:** https://console.cloud.google.com/
2. **Sign in** with your Google account (use personal or company account)
3. **Create new project:**
   - Click "Select a Project" (top left, next to Google Cloud logo)
   - Click "NEW PROJECT"
   - **Project Name:** `KVS-SCUBA-Maldives-2026`
   - **Organization:** Leave as default (No organization)
   - Click **CREATE**
   - Wait 30 seconds for project to initialize

### 1.2 Enable OAuth Consent Screen

1. **Navigate:** https://console.cloud.google.com/apis/consent
2. **Select your project** if prompted
3. **User Type:** Select **EXTERNAL**
4. **Click CREATE**
5. **Fill OAuth consent screen:**

   **App Information:**
   - App name: `KVS-SCUBA Maldives`
   - User support email: `mulalic71@gmail.com` (your email)
   - Developer contact: Same email
   
   **Scopes:**
   - Click "ADD OR REMOVE SCOPES"
   - Search for and add:
     - `email`
     - `profile`
     - `openid`
   - Click **UPDATE**

6. **Test Users:**
   - Add email addresses of team members who will test
   - Add: `mulalic71@gmail.com`, `adnandrnda@hotmail.com`, `samirso@hotmail.com`

7. **Click SAVE AND CONTINUE**

### 1.3 Create OAuth 2.0 Credentials

1. **Navigate:** https://console.cloud.google.com/apis/credentials
2. **Create Credentials:**
   - Click **+ CREATE CREDENTIALS** (top button)
   - Select **OAuth client ID**

3. **Configure OAuth Consent Screen:**
   - If prompted, click **Configure Consent Screen** → go to step 5 above

4. **Create OAuth Client ID:**
   - **Application type:** Select "Web application"
   - **Name:** `KVS-SCUBA Web App`
   
   **Authorized JavaScript origins** (copy-paste carefully):
   ```
   http://localhost:3000
   http://localhost:5173
   https://wgghitqmclpttslzffge.supabase.co
   ```
   
   **Authorized redirect URIs** (⚠️ COPY CAREFULLY - MUST START WITH "http"):
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   https://wgghitqmclpttslzffge.supabase.co/auth/v1/callback
   https://wgghitqmclpttslzffge.supabase.co/auth/v1/providers/callback/google
   ```
   
   ⚠️ **IMPORTANT:** When copying, make sure:
   - URIs start with **"http://"** (NOT "ttp://")
   - No extra spaces before/after
   - URLs are complete and exact

---

## ⚠️ Common Copy-Paste Error

**ERROR:** `Redirect URIs: ttp://localhost:3000/auth/callback`

**PROBLEM:** Missing the "h" - "ttp://" instead of "http://"

**SOLUTION:** 
1. Go back to form
2. Click on "Authorized redirect URIs" field
3. Clear all entries
4. Copy each URL one by one from code block above
5. Make sure each starts with **"http://"** (NOT "ttp://")

**Or manually type:**
```
http://localhost:3000/auth/callback
```

---
   ```
   CLIENT_ID: [COPY THIS]
   CLIENT_SECRET: [COPY THIS]
   ```
   - Copy and save these securely (you'll need them in next step)
   - You can download as JSON too

---

## 📱 Step 2: Configure Supabase Google OAuth Provider

### 2.1 Add Google Credentials to Supabase

1. **Go to:** https://supabase.com/dashboard/project/wgghitqmclpttslzffge/settings/auth-providers

2. **Find "Google" provider**

3. **Enable Google:**
   - Toggle switch to ON
   - **Client ID:** Paste from Google Cloud (from Step 1.3)
   - **Client Secret:** Paste from Google Cloud (from Step 1.3)

4. **Click SAVE**

5. **Verify Configuration:**
   - You should see a green checkmark
   - Note the "Callback URL" it shows (for your records)

### 2.2 Enable Email Provider (Backup Auth)

1. **On same page, find "Email"**
2. **Enable Email:**
   - Toggle switch to ON
   - Leave "Confirm email" ON (best practice)

3. **Click SAVE**

### 2.3 Configure Supabase URL Settings

⚠️ **Important:** Supabase needs these URLs configured separately from Google Cloud

1. **In Supabase, go to:** Authentication → URL Configuration
   
2. **Site URL (Required):**
   ```
   http://localhost:3000
   ```
   - This is where users return after authentication
   
3. **Redirect URLs (You must add these manually):**
   - Click **"Add URL"** for each of these:
   ```
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   https://wgghitqmclpttslzffge.supabase.co/auth/v1/callback
   https://wgghitqmclpttslzffge.supabase.co/auth/v1/providers/callback/google
   ```
   
4. **Additional Security (optional):**
   - Add wildcard for production later: `https://*.yourdomain.com`
   
5. **Click SAVE**

✅ **Verify:** You should see all 4 redirect URLs listed with a green checkmark

---

## 💻 Step 3: Update supabaseClient.ts

Update your Supabase client to expose auth methods:

```typescript
// services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export auth functions for convenience
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'consent', // Force Google account selector
      },
    },
  });
  
  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
  
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
```

---

## 🔄 Step 4: Create AuthProvider Context

Create `contexts/AuthProvider.tsx` - wraps entire app with auth state:

```typescript
// contexts/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setError(null);
      
      // Log auth events for debugging
      console.log('Auth event:', event, session?.user?.email);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🛡️ Step 5: Protected Route Wrapper

Create `components/ProtectedRoute.tsx`:

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page</p>
          <a href="/auth" className="btn-primary inline-block">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## 📝 Step 6: Update App.tsx to Use AuthProvider

Wrap your app with AuthProvider at the root level:

```typescript
// App.tsx - Top of file
import { AuthProvider } from './contexts/AuthProvider';

// Update your root return:
export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background dark:bg-background-dark">
        {/* Rest of your app */}
      </div>
    </AuthProvider>
  );
}
```

---

## 🧪 Step 7: Test OAuth Flow

### Test Google Sign-In:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Create simple login button in your app:**
   ```typescript
   import { signInWithGoogle } from '../services/supabaseClient';
   
   export const LoginButton = () => {
     return (
       <button 
         onClick={signInWithGoogle}
         className="btn-primary"
       >
         Sign In with Google
       </button>
     );
   };
   ```

3. **Click button and test:**
   - Should redirect to Google login
   - After login, should return to app
   - `useAuth()` hook should show `isAuthenticated: true`
   - Browser console should show user email

### Debug Tips:

```typescript
// Add to any component to see auth state
import { useAuth } from '../contexts/AuthProvider';

export const DebugAuth = () => {
  const auth = useAuth();
  
  return (
    <pre className="bg-gray-100 p-4 rounded text-xs">
      {JSON.stringify(auth, null, 2)}
    </pre>
  );
};
```

---

## ⚠️ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Redirect URI mismatch" | OAuth settings don't match | Check Google Cloud AND Supabase have identical URIs |
| White page after Google login | Auth callback not configured | Ensure `http://localhost:3000` in Supabase URL config |
| "User logged in but no data" | Session not persisted | Check browser localStorage for `sb-*` keys |
| Can't select Google account twice | Normal behavior | Clear cache or use incognito mode |
| **"ttp://localhost:3000"** | Copy-paste typo - missing "h" | Manually type or copy carefully: **http://localhost:3000/auth/callback** |
| "The request failed - invalid redirect URI" | Space/typo in URL | Double-check: no leading/trailing spaces, starts with "**http://**" |

---

## 🎯 Success Checklist

- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials generated (Client ID + Secret saved)
- [ ] Supabase Google provider enabled with credentials
- [ ] Email provider enabled in Supabase
- [ ] `supabaseClient.ts` updated with auth methods
- [ ] `AuthProvider.tsx` context created
- [ ] `ProtectedRoute.tsx` wrapper created
- [ ] `App.tsx` wrapped with AuthProvider
- [ ] Test login works - redirects to Google, returns to app
- [ ] Browser console shows logged-in user email
- [ ] `useAuth()` hook works in components

---

## 📌 Next Steps

Once OAuth is working:

1. **SECTION 1.2:** Create user_roles table in database
2. **SECTION 1.3:** Build comprehensive admin panel
3. **SECTION 1.4:** Implement role-based access control

**Ready to proceed with Step 1.1?** Execute these steps and let me know when you have the Google Client ID & Secret.
