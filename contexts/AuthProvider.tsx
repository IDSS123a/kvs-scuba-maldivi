import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  userEmail?: string;
  isAdmin: boolean;
  role: 'admin' | 'user' | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setError(null);
        
        // Check admin status
        if (currentUser?.email) {
          const adminStatus = ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
          setIsAdmin(adminStatus);
          setRole(adminStatus ? 'admin' : 'user');
        } else {
          setIsAdmin(false);
          setRole(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        setError(errorMessage);
        console.error('Auth init error:', errorMessage);
        setUser(null);
        setIsAdmin(false);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'User:', session?.user?.email);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setError(null);
        
        // Check admin status on auth change
        if (currentUser?.email) {
          const adminStatus = ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
          setIsAdmin(adminStatus);
          setRole(adminStatus ? 'admin' : 'user');
        } else {
          setIsAdmin(false);
          setRole(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
      setRole(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    userEmail: user?.email,
    isAdmin,
    role,
    logout,
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
