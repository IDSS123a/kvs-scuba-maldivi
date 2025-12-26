import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Loading spinner component with theme support
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
};

/**
 * Interface for route component props
 */
interface RouteComponentProps {
  element: React.ReactElement;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 */
export const ProtectedRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth';
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return element;
};

/**
 * AdminRoute Component
 */
export const AdminRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/auth';
      } else if (user.role !== 'admin') {
        window.location.href = '/';
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return element;
};

/**
 * ApprovedRoute Component
 */
export const ApprovedRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/auth';
      } else if (user.role !== 'member' && user.role !== 'admin') {
        // Redirect if not approved (pending)
        // Adjust redirection target as needed
        console.warn('User not approved');
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || (user.role !== 'member' && user.role !== 'admin')) {
    return null;
  }

  return element;
};

export default ProtectedRoute;
