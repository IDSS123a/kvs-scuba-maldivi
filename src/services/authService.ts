import { createClient } from '@supabase/supabase-js';
import { User, Session } from '../types/auth';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication response type
 */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

/**
 * Sign-up user data type
 */
export interface SignUpData {
  email: string;
  full_name: string;
  ssi_number: string;
  password?: string;
}

/**
 * User activity type
 */
export interface ActivityLog {
  user_id?: string;
  activity_type: string;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
}

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<AuthResponse>} Authentication response
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logActivity('login_failed', undefined, undefined);
      return { user: null, session: null, error: error.message };
    }

    await logActivity('login_success', undefined, undefined);

    // Cast Supabase user/session to our strict types
    return {
      user: data.user as unknown as User,
      session: data.session as unknown as Session,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sign in error:', errorMessage);
    return { user: null, session: null, error: errorMessage };
  }
}

/**
 * Sign in with Google OAuth
 * @returns {Promise<AuthResponse>} Authentication response
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      await logActivity('google_login_failed', undefined, undefined);
      return { user: null, session: null, error: error.message };
    }

    await logActivity('google_login_initiated', undefined, undefined);

    return {
      user: null,
      session: null,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Google sign in error:', errorMessage);
    return { user: null, session: null, error: errorMessage };
  }
}

/**
 * Sign up new user for access
 * Creates auth user and profile with role='pending'
 * @param {SignUpData} userData - User data for signup
 * @returns {Promise<AuthResponse>} Authentication response
 */
export async function signUpForAccess(userData: SignUpData): Promise<AuthResponse> {
  try {
    const { email, full_name, ssi_number, password } = userData;

    // Generate a temporary password if not provided
    const tempPassword = password || Math.random().toString(36).slice(-12);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name,
          ssi_number,
        },
      },
    });

    if (authError) {
      await logActivity('signup_failed', undefined, undefined);
      return { user: null, session: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, session: null, error: 'User creation failed' };
    }

    // Create user profile with role='pending'
    const { error: profileError } = await supabase
      .from('public.users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name,
          ssi_number,
          role: 'pending',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // In a real app we might want to rollback the auth user creation here
      await logActivity('profile_creation_failed', undefined, undefined);
      return { user: null, session: null, error: profileError.message };
    }

    await logActivity('signup_success', undefined, undefined);

    return {
      user: authData.user as unknown as User,
      session: authData.session as unknown as Session,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sign up error:', errorMessage);
    return { user: null, session: null, error: errorMessage };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{error: string | null}>} Sign out result
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    await logActivity('logout', undefined, undefined);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sign out error:', errorMessage);
    return { error: errorMessage };
  }
}

/**
 * Get current session
 * @returns {Promise<Session | null>} Current session or null
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session retrieval error:', error.message);
      return null;
    }

    return data.session as unknown as Session;
  } catch (err) {
    console.error('Error getting session:', err);
    return null;
  }
}

/**
 * Refresh user data from public.users table
 * @returns {Promise<User | null>} Updated user profile or null
 */
export async function refreshUserData(): Promise<User | null> {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return null;
    }

    const { data, error } = await supabase
      .from('public.users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('User data refresh error:', error.message);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error('Error refreshing user data:', err);
    return null;
  }
}

/**
 * Log user activity to user_activity table
 * @param {string} activity_type - Type of activity
 * @param {string} ip_address - User IP address (optional)
 * @param {string} user_agent - User agent string (optional)
 * @returns {Promise<void>}
 */
export async function logActivity(
  activity_type: string,
  ip_address?: string,
  user_agent?: string
): Promise<void> {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id;

    const activityLog: ActivityLog = {
      activity_type,
      timestamp: new Date().toISOString(),
    };

    if (userId) {
      activityLog.user_id = userId;
    }

    if (ip_address) {
      activityLog.ip_address = ip_address;
    }

    if (user_agent) {
      activityLog.user_agent = user_agent;
    }

    const { error } = await supabase
      .from('user_activity')
      .insert([activityLog]);

    if (error) {
      // Silently ignore - user_activity table is optional
    }
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

/**
 * Get user's current role
 * @returns {Promise<string | null>} User role or null
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return null;
    }

    const { data, error } = await supabase
      .from('public.users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('User role retrieval error:', error.message);
      return null;
    }

    return data?.role || null;
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
}

/**
 * Export Supabase client for use in other parts of the application
 */
export { supabase };
