import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LogOut,
  User,
  CheckSquare,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/authService';

/**
 * UserMenu Component
 * Displays user avatar trigger and dropdown menu with user info, language switcher,
 * theme toggle, and logout functionality
 */
const UserMenu: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize dark mode state from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    updateTheme(isDark);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  /**
   * Get user avatar URL or generate initials
   */
  const getAvatar = () => {
    if (user?.user_metadata && user.user_metadata.avatar_url) {
      return user.user_metadata.avatar_url;
    }

    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }

    // Fallback to gravatar if email exists
    if (user?.email) {
      const emailHash = btoa(user.email.toLowerCase().trim())
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      return `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=40`;
    }

    return null;
  };

  /**
   * Get user initials for fallback display
   */
  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'U';
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Update theme in DOM and localStorage
   */
  const updateTheme = (dark: boolean) => {
    const htmlElement = document.documentElement;
    if (dark) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  /**
   * Toggle dark/light mode
   */
  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    updateTheme(newDarkMode);

    // Log the theme change
    localStorage.setItem('themePreference', newDarkMode ? 'dark' : 'light');
  };

  /**
   * Change language and close dropdown
   */
  const handleLanguageChange = (lang: 'en' | 'bs') => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    setIsOpen(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOut();
      if (!result.error) {
        setIsOpen(false);
        // AuthContext will handle redirect
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Navigate to profile page
   */
  const handleProfileClick = () => {
    // Navigate to profile page (adjust route as needed)
    window.location.href = '/profile';
    setIsOpen(false);
  };

  /**
   * Navigate to checklist page
   */
  const handleChecklistClick = () => {
    // Navigate to checklist page (adjust route as needed)
    window.location.href = '/checklist';
    setIsOpen(false);
  };

  const avatar = getAvatar();
  const initials = getInitials();
  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="relative">
      {/* Avatar Button - Trigger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center justify-center"
        aria-label={t('common.user_menu') || 'User menu'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar Circle */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200 shadow-sm group-hover:shadow-md">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
          <span className="text-xs font-bold text-white select-none">
            {initials}
          </span>
        </div>

        {/* Show user name on hover */}
        <div className="invisible group-hover:visible absolute top-full right-0 mt-2 px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded whitespace-nowrap pointer-events-none z-40">
          {userName}
          <div className="absolute bottom-full right-2 w-2 h-2 bg-slate-900 rotate-45 translate-y-1"></div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {userEmail}
            </p>
          </div>

          {/* Language Selector */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Globe size={14} />
              {t('common.language') || 'Language'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('bs')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${i18n.language === 'bs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                🇧🇦 Bosanski
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${i18n.language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-300"
              aria-label={t('common.toggle_theme') || 'Toggle theme'}
            >
              {isDarkMode ? (
                <>
                  <Sun size={18} className="text-yellow-500" />
                  <span className="text-sm font-medium flex-1 text-left">
                    {t('common.light_mode') || 'Light Mode'}
                  </span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-slate-400" />
                  <span className="text-sm font-medium flex-1 text-left">
                    {t('common.dark_mode') || 'Dark Mode'}
                  </span>
                </>
              )}
              <div
                className={`w-10 h-6 rounded-full bg-slate-300 dark:bg-slate-600 relative transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                ></div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-2 py-2 space-y-1 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-300"
            >
              <User size={18} />
              <span className="text-sm font-medium">{t('common.my_profile') || 'My Profile'}</span>
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </button>

            <button
              onClick={handleChecklistClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-700 dark:text-slate-300"
            >
              <CheckSquare size={18} />
              <span className="text-sm font-medium">{t('common.my_checklist') || 'My Checklist'}</span>
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </button>
          </div>

          {/* Logout Button */}
          <div className="px-2 py-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium flex-1 text-left">
                {isLoggingOut ? (t('common.logging_out') || 'Logging out...') : (t('common.logout') || 'Logout')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
