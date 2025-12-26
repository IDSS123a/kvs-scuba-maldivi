import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, User, Award, CheckCircle, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';
import { authService } from '@/services/authService';

// Types
interface LoginFormData {
  email: string;
  password: string;
}

interface RequestAccessFormData {
  fullName: string;
  email: string;
  ssiNumber: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'divemaster';
  agreedToTerms: boolean;
}

interface TabState {
  activeTab: 'login' | 'request-access';
  loginForm: LoginFormData;
  requestForm: RequestAccessFormData;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  showPassword: boolean;
}

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'divemaster';

// Experience level options
const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner (0-10 dives)' },
  { value: 'intermediate', label: 'Intermediate (11-50 dives)' },
  { value: 'advanced', label: 'Advanced (51-100 dives)' },
  { value: 'divemaster', label: 'Divemaster' },
];

export const AuthPortal: React.FC = () => {
  const [state, setState] = useState<TabState>({
    activeTab: 'login',
    loginForm: { email: '', password: '' },
    requestForm: {
      fullName: '',
      email: '',
      ssiNumber: '',
      experienceLevel: 'beginner',
      agreedToTerms: false,
    },
    loading: false,
    error: null,
    successMessage: null,
    showPassword: false,
  });

  // Refs for auto-focus
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const requestNameRef = useRef<HTMLInputElement>(null);

  // Auto-focus on tab change
  useEffect(() => {
    if (state.activeTab === 'login') {
      loginEmailRef.current?.focus();
    } else {
      requestNameRef.current?.focus();
    }
  }, [state.activeTab]);

  // Clear messages when switching tabs
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      successMessage: null,
    }));
  }, [state.activeTab]);

  const handleTabChange = (tab: 'login' | 'request-access') => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      loginForm: {
        ...prev.loginForm,
        [name]: value,
      },
    }));
  };

  const handleRequestInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setState((prev) => ({
        ...prev,
        requestForm: {
          ...prev.requestForm,
          [name]: checked,
        },
      }));
    } else {
      setState((prev) => ({
        ...prev,
        requestForm: {
          ...prev.requestForm,
          [name]: value,
        },
      }));
    }
  };

  const validateLoginForm = (): boolean => {
    const { email, password } = state.loginForm;
    
    if (!email) {
      setState((prev) => ({ ...prev, error: 'Email is required' }));
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState((prev) => ({ ...prev, error: 'Please enter a valid email address' }));
      return false;
    }
    
    if (!password) {
      setState((prev) => ({ ...prev, error: 'Password is required' }));
      return false;
    }
    
    if (password.length < 6) {
      setState((prev) => ({ ...prev, error: 'Password must be at least 6 characters' }));
      return false;
    }
    
    return true;
  };

  const validateRequestForm = (): boolean => {
    const { fullName, email, ssiNumber, agreedToTerms } = state.requestForm;
    
    if (!fullName.trim()) {
      setState((prev) => ({ ...prev, error: 'Full name is required' }));
      return false;
    }
    
    if (!email) {
      setState((prev) => ({ ...prev, error: 'Email is required' }));
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState((prev) => ({ ...prev, error: 'Please enter a valid email address' }));
      return false;
    }
    
    if (!ssiNumber.trim()) {
      setState((prev) => ({ ...prev, error: 'SSI Number is required' }));
      return false;
    }
    
    if (!agreedToTerms) {
      setState((prev) => ({
        ...prev,
        error: 'You must agree to the Privacy Policy and Terms of Service',
      }));
      return false;
    }
    
    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      successMessage: null,
    }));
    
    try {
      await authService.signIn(state.loginForm.email, state.loginForm.password);
      setState((prev) => ({
        ...prev,
        loading: false,
        successMessage: 'Sign in successful! Redirecting...',
        loginForm: { email: '', password: '' },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleGoogleSignIn = async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      successMessage: null,
    }));
    
    try {
      await authService.signInWithGoogle();
      setState((prev) => ({
        ...prev,
        loading: false,
        successMessage: 'Google sign in successful! Redirecting...',
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign in failed. Please try again.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRequestForm()) return;
    
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      successMessage: null,
    }));
    
    try {
      // Call authService to request access
      await authService.requestAccess({
        fullName: state.requestForm.fullName,
        email: state.requestForm.email,
        ssiNumber: state.requestForm.ssiNumber,
        experienceLevel: state.requestForm.experienceLevel,
      });
      
      setState((prev) => ({
        ...prev,
        loading: false,
        successMessage:
          'Access request submitted successfully! Check your email for next steps.',
        requestForm: {
          fullName: '',
          email: '',
          ssiNumber: '',
          experienceLevel: 'beginner',
          agreedToTerms: false,
        },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Request submission failed. Please try again.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            KVS-SCUBA Maldives
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">2026 Diving Expeditions</p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-4 px-4 font-semibold text-sm transition-all duration-300 relative ${
                state.activeTab === 'login'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
              aria-selected={state.activeTab === 'login'}
              role="tab"
            >
              Login
              {state.activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange('request-access')}
              className={`flex-1 py-4 px-4 font-semibold text-sm transition-all duration-300 relative ${
                state.activeTab === 'request-access'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
              aria-selected={state.activeTab === 'request-access'}
              role="tab"
            >
              Request Access
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Error Message */}
            {state.error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200">{state.error}</p>
              </div>
            )}

            {/* Success Message */}
            {state.successMessage && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-200">{state.successMessage}</p>
              </div>
            )}

            {/* Login Tab */}
            {state.activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-300">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      ref={loginEmailRef}
                      type="email"
                      id="email"
                      name="email"
                      value={state.loginForm.email}
                      onChange={handleLoginInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={state.loading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type={state.showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={state.loginForm.password}
                      onChange={handleLoginInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={state.loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showPassword: !prev.showPassword,
                        }))
                      }
                      className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label={state.showPassword ? 'Hide password' : 'Show password'}
                    >
                      {state.showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {state.loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">OR</span>
                  <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={state.loading}
                  className="w-full py-2.5 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {state.loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>

                {/* Footer Links */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-2 text-center text-sm">
                    <a
                      href="#forgot-password"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </a>
                    <div className="flex gap-2 justify-center text-slate-600 dark:text-slate-400">
                      <a href="#privacy" className="hover:text-slate-900 dark:hover:text-white hover:underline">
                        Privacy Policy
                      </a>
                      <span>•</span>
                      <a href="#terms" className="hover:text-slate-900 dark:hover:text-white hover:underline">
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Request Access Tab */}
            {state.activeTab === 'request-access' && (
              <form onSubmit={handleRequestAccessSubmit} className="space-y-4 animate-in fade-in duration-300">
                {/* Full Name Input */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      ref={requestNameRef}
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={state.requestForm.fullName}
                      onChange={handleRequestInputChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={state.loading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={state.requestForm.email}
                      onChange={handleRequestInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={state.loading}
                    />
                  </div>
                </div>

                {/* SSI Number Input */}
                <div>
                  <label htmlFor="ssiNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    SSI Number
                  </label>
                  <input
                    type="text"
                    id="ssiNumber"
                    name="ssiNumber"
                    value={state.requestForm.ssiNumber}
                    onChange={handleRequestInputChange}
                    placeholder="Your SSI certification number"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={state.loading}
                  />
                </div>

                {/* Experience Level Dropdown */}
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Diving Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={state.requestForm.experienceLevel}
                    onChange={handleRequestInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={state.loading}
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreedToTerms"
                    name="agreedToTerms"
                    checked={state.requestForm.agreedToTerms}
                    onChange={handleRequestInputChange}
                    className="w-5 h-5 mt-0.5 border border-slate-300 dark:border-slate-600 rounded accent-blue-600 cursor-pointer"
                    disabled={state.loading}
                  />
                  <label htmlFor="agreedToTerms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    I agree to the{' '}
                    <a href="#privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="#terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </a>
                  </label>
                </div>

                {/* Request Access Button */}
                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  {state.loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Access'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Part of KVS-SCUBA Maldives 2026 Diving Expeditions
        </p>
      </div>
    </div>
  );
};

export default AuthPortal;
