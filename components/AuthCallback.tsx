import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * OAuth Callback Page
 * This page is called by Google after successful authentication
 * It handles the auth code exchange and redirects to dashboard
 */
export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the code exchange
        // Just wait for the session to be established
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          console.log('✅ Auth successful for:', session.user.email);
          // Redirect to dashboard after short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setError('No session found after authentication');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        console.error('Auth callback error:', errorMessage);
        setError(errorMessage);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              ❌ Authentication Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Go Back
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Signing you in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we authenticate your account
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
