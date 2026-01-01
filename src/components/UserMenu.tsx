
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Moon, Sun, Globe, LogOut, User, ChevronDown } from 'lucide-react';

interface UserMenuProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    lang: 'BS' | 'EN';
    onLanguageChange: (lang: 'BS' | 'EN') => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
    theme,
    onThemeChange,
    lang,
    onLanguageChange
}) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        onThemeChange(newTheme);
    };

    const handleLanguageToggle = () => {
        const newLang = lang === 'BS' ? 'EN' : 'BS';
        onLanguageChange(newLang);
    };

    const t = {
        profile: lang === 'BS' ? 'Moj Profil' : 'My Profile',
        lightMode: lang === 'BS' ? 'Svjetlosna Tema' : 'Light Mode',
        darkMode: lang === 'BS' ? 'Tamna Tema' : 'Dark Mode',
        language: lang === 'BS' ? 'Jezik' : 'Language',
        logout: lang === 'BS' ? 'Odjava' : 'Logout'
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border shadow-sm ${theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 border-white/10'
                    : 'bg-white hover:bg-gray-50 border-gray-100'
                    }`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-md ${theme === 'dark' ? 'bg-[#0a9396]' : 'bg-[#005f73]'
                    }`}>
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>

                <span className={`text-[10px] font-black hidden sm:inline uppercase tracking-widest ${theme === 'dark' ? 'text-gray-300' : 'text-[#001219]'
                    }`}>
                    {user?.displayName || 'User'}
                </span>

                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-4 w-72 rounded-[32px] shadow-2xl border z-[200] overflow-hidden animate-in zoom-in-95 duration-200 ${theme === 'dark'
                        ? 'bg-[#001219] border-white/10 text-white shadow-black/80'
                        : 'bg-white border-cyan-50 text-[#001219] shadow-cyan-900/10'
                        }`}
                >
                    <div className={`px-8 py-8 border-b ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-cyan-50 bg-cyan-50/30'
                        }`}>
                        <div className="flex items-center gap-5">
                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-white text-2xl shadow-xl ${theme === 'dark' ? 'bg-[#0a9396]' : 'bg-[#005f73]'
                                }`}>
                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-lg truncate uppercase tracking-tight">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className={`text-[10px] font-bold truncate tracking-widest uppercase opacity-40`}>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3">
                        {[
                            { id: 'profile', label: t.profile, icon: User, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                            { id: 'theme', label: theme === 'dark' ? t.lightMode : t.darkMode, icon: theme === 'dark' ? Sun : Moon, color: 'text-amber-500', bg: 'bg-amber-500/10', onClick: handleThemeToggle },
                            { id: 'lang', label: t.language, extra: lang, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10', onClick: handleLanguageToggle }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className={`w-full p-4 flex items-center gap-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                    <item.icon size={16} />
                                </div>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.extra && (
                                    <span className={`px-2 py-0.5 rounded-md border text-[8px] ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-100 text-gray-500'
                                        }`}>
                                        {item.extra}
                                    </span>
                                )}
                            </button>
                        ))}

                        <div className={`h-px my-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`} />

                        <button
                            onClick={handleLogout}
                            className={`w-full p-4 flex items-center gap-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${theme === 'dark' ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform`}>
                                <LogOut size={16} />
                            </div>
                            <span className="flex-1 text-left">{t.logout}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
