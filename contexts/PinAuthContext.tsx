import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PinAuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  accessStatus: 'pending' | 'approved' | 'revoked';
}

export interface PinAuthContextType {
  user: PinAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (user: PinAuthUser) => void;
  logout: () => void;
  requestAccess: (data: any) => Promise<void>;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

export const PinAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PinAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const checkSavedSession = () => {
      try {
        const savedUser = localStorage.getItem('kvs_pin_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.warn('Could not restore session:', err);
        localStorage.removeItem('kvs_pin_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedSession();
  }, []);

  const login = (newUser: PinAuthUser) => {
    setUser(newUser);
    localStorage.setItem('kvs_pin_user', JSON.stringify(newUser));
    setError(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kvs_pin_user');
    localStorage.removeItem('kvs_pin_lockout_time');
    localStorage.removeItem('kvs_pin_attempts');
  };

  const requestAccess = async (data: any) => {
    // This is handled by the AccessRequestForm component
    // Just a placeholder for context purposes
    setError(null);
  };

  const value: PinAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    requestAccess
  };

  return (
    <PinAuthContext.Provider value={value}>
      {children}
    </PinAuthContext.Provider>
  );
};

export const usePinAuth = (): PinAuthContextType => {
  const context = useContext(PinAuthContext);
  if (!context) {
    throw new Error('usePinAuth must be used within PinAuthProvider');
  }
  return context;
};
