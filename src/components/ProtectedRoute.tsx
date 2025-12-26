import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
 * 
 * @param element - The component to render if authenticated
 * @returns The protected route component or redirect/loading state
 * 
 * @example
 * <Route
 *   path="/dashboard"
 *   element={<ProtectedRoute element={<Dashboard />} />}
 * />
 */
export const ProtectedRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated, preserving the original location
      const currentLocation = window.location.pathname;
      navigate('/login', { state: { from: currentLocation } });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if not authenticated (navigate effect will handle redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Render the protected component
  return element;
};

/**
 * AdminRoute Component
 * Extends ProtectedRoute for admin-only routes
 * 
 * @param element - The component to render if user is admin
 * @returns The admin route component or redirect/loading state
 * 
 * @example
 * <Route
 *   path="/admin"
 *   element={<AdminRoute element={<AdminPanel />} />}
 * />
 */
export const AdminRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        const currentLocation = window.location.pathname;
        navigate('/login', { state: { from: currentLocation } });
        return;
      }

      // Redirect to dashboard if not admin
      if (user.role !== 'admin') {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if not authenticated or not admin (navigate effect will handle redirect)
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  // Render the admin component
  return element;
};

/**
 * ApprovedRoute Component
 * For routes requiring user to be approved (member or admin)
 * 
 * @param element - The component to render if user is approved
 * @returns The approved route component or redirect/loading state
 * 
 * @example
 * <Route
 *   path="/bookings"
 *   element={<ApprovedRoute element={<Bookings />} />}
 * />
 */
export const ApprovedRoute: React.FC<RouteComponentProps> = ({ element }) => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        const currentLocation = window.location.pathname;
        navigate('/login', { state: { from: currentLocation } });
        return;
      }

      // Redirect to pending approval if user is pending (not member or admin)
      if (user.role !== 'member' && user.role !== 'admin') {
        navigate('/pending-approval', { replace: true });
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if not authenticated or not approved (navigate effect will handle redirect)
  if (!isAuthenticated || !user || (user.role !== 'member' && user.role !== 'admin')) {
    return null;
  }

  // Render the approved component
  return element;
};

export default ProtectedRoute;
