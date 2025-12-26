import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getCurrentSession,
  getUserRole,
  refreshUserData,
  logActivity,
  supabase,
} from '../services/authService';
import { User, Session } from '../types/auth';

/**
 * Auth context state interface
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Context Provider Component
 * Manages global authentication state and listens to auth changes
 * @param {Object} props - Provider props
 * @param {ReactNode} props.children - Child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh user data from Supabase
   */
  const refreshUser = async () => {
    try {
      const userData = await refreshUserData();
      if (userData) {
        setUser(userData);
        setRole(userData.role || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh user';
      console.error('Error refreshing user:', errorMessage);
      setError(errorMessage);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Initialize auth state and set up listeners
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get current session
        const currentSession = await getCurrentSession();
        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);

          // Fetch user profile with role
          const userData = await refreshUserData();
          if (userData) {
            setRole(userData.role || null);
          } else {
            // Get role directly if full profile not available
            const userRole = await getUserRole();
            setRole(userRole);
          }

          // Log session start
          await logActivity('session_start', undefined, navigator.userAgent);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize auth';
        console.error('Auth initialization error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session as unknown as Session);

      if (session?.user) {
        setUser(session.user as unknown as User);

        // Fetch updated user profile
        const userData = await refreshUserData();
        if (userData) {
          setRole(userData.role || null);
        } else {
          const userRole = await getUserRole();
          setRole(userRole);
        }

        // Log auth state change
        await logActivity(`auth_${event}`, undefined, navigator.userAgent);
      } else {
        // User signed out
        setUser(null);
        setRole(null);
        await logActivity('auth_signed_out', undefined, navigator.userAgent);
      }

      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    role,
    isLoading,
    error,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * @returns {AuthContextType} Auth context value
 * @throws {Error} If hook is used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Higher-order component for protecting routes
 * @param {React.ComponentType<any>} Component - Component to protect
 * @returns {React.ComponentType<any>} Protected component
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isLoading, session } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return <div>Not authenticated</div>;
    }

    return <Component {...props} />;
  };
}
