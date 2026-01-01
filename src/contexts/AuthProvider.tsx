import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface AppUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'user';
}

export interface AuthContextType {
    user: AppUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    userEmail?: string;
    isAdmin: boolean;
    role: 'admin' | 'user' | null;
    login: (user: AppUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState<'admin' | 'user' | null>(null);

    useEffect(() => {
        // Restore session from localStorage on mount
        const savedSession = localStorage.getItem('kvs_auth_session');
        if (savedSession) {
            try {
                const appUser = JSON.parse(savedSession) as AppUser;
                setUser(appUser);
                // Check BOTH database role AND hardcoded list
                // This allows assigning admin rights via Admin Panel to other users
                const adminStatus = appUser.role === 'admin' || ADMIN_EMAILS.includes(appUser.email.toLowerCase());
                setIsAdmin(adminStatus);
                setRole(appUser.role);
            } catch (err) {
                console.error('[Auth] Failed to restore session:', err);
                localStorage.removeItem('kvs_auth_session');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (appUser: AppUser) => {
        console.log(`[Auth] PIN login successful for ${appUser.displayName}`);
        setUser(appUser);
        // Use role from DB as primary source of truth, fallback to hardcoded list
        const adminStatus = appUser.role === 'admin' || ADMIN_EMAILS.includes(appUser.email.toLowerCase());
        setIsAdmin(adminStatus);
        setRole(appUser.role);
        localStorage.setItem('kvs_auth_session', JSON.stringify(appUser));
    };

    const logout = () => {
        console.log('[Auth] User logged out');
        setUser(null);
        setIsAdmin(false);
        setRole(null);
        setError(null);
        localStorage.removeItem('kvs_auth_session');
        localStorage.removeItem('kvs_admin_unlocked');
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        userEmail: user?.email,
        isAdmin,
        role,
        login,
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
