
import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  fallback
}) => {
  const { isAuthenticated, isLoading, role, userEmail } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access this page
          </p>
          <a
            href="/auth"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your account ({userEmail}) does not have admin privileges.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Only authorized administrators can access this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
