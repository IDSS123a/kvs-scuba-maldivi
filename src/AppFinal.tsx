import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INLINE TIPOVI ---
export type Theme = 'light' | 'dark';
export type Language = 'BS' | 'EN';

export enum View {
    DASHBOARD = 'dashboard',
    ITINERARY = 'itinerary',
    PARTICIPANTS = 'participants',
    GALLERY = 'gallery',
    PREPARATION = 'preparation',
    GUIDES = 'guides',
    ESSENTIAL_INFO = 'essentialInfo',
    ADMIN = 'admin'
}
// ------------------------------------------

// --- IMPORTI SA MALIM SLOVIMA (FIX ZA LINUX/VERCEL) ---
// Git vjerovatno misli da su fajlovi malim slovima.
import Dashboard from './components/dashboard.tsx';
import Itinerary from './components/itinerary.tsx';
import Participants from './components/participants.tsx';
import Gallery from './components/gallery.tsx';
import Preparation from './components/preparation.tsx';
import EssentialInfo from './components/essentialInfo.tsx';
import MaldivesTripGuide from './components/maldivesTripGuide.tsx';
import Admin from './components/admin.tsx';
import Auth from './components/auth.tsx';
import ChatBot from './components/chatBot.tsx';
import { UserMenu } from './components/userMenu.tsx';
import { AuthProvider, useAuth } from './contexts/AuthProvider.tsx'; // Contexts obicno ostaju ok
import LoginPage from './components/loginPage.tsx';
import AuthCallback from './components/authCallback.tsx';
import { ProtectedRoute } from './components/protectedRoute.tsx';
import { SystemDiagnostics } from './components/systemDiagnostics.tsx';
import ShoppingCalculator from './components/shoppingCalculator.tsx';
import { ShoppingCart } from 'lucide-react';
import './utils/formDiagnostics';

import {
    LayoutDashboard,
    Map,
    Users,
    Camera,
    ClipboardList,
    Settings,
    LogOut,
    ShieldCheck,
    Menu,
    X,
    Search,
    User as UserIcon,
    Facebook,
    Instagram,
    Globe,
    Mail,
    CheckCircle2,
    Moon,
    Sun,
    Languages,
    ExternalLink,
    ShieldAlert,
    HelpCircle,
    Info,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

const LOGO_URL = "https://www.scubasarajevo.com/wp-content/uploads/2024/02/cropped-LOGO-SCUBA-Sarajevo-okrugli-240px.png";
const AUTHORIZED_ADMINS = ["Davor Mulalić", "Adnan Drnda", "Samir Solaković", "Davor Mulalic", "Adnan Drnda", "Samir Solakovic"];
const ADMIN_EMAILS = ["mulalic71@gmail.com", "adnandrnda@hotmail.com", "samirso@hotmail.com"];

const getCurrentRoute = (): string => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/auth/callback')) return '/auth/callback';
    if (pathname.startsWith('/auth')) return '/auth';
    return '/';
};

const AppContent: React.FC = () => {
    const { user: currentUser, isLoading, isAdmin, logout } = useAuth();
    const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeModal, setActiveModal] = useState<'faq' | 'safety' | 'info' | null>(null);
    const [currentRoute, setCurrentRoute] = useState<string>(getCurrentRoute());

    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('kvs_theme') as Theme) || 'light');
    const [lang, setLang] = useState<Language>(() => (localStorage.getItem('kvs_lang') as Language) || 'BS');

    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    // SHOPPING STATE
    const [isShoppingOpen, setIsShoppingOpen] = useState(false);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentRoute(getCurrentRoute());
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        localStorage.setItem('kvs_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('kvs_lang', lang);
    }, [lang]);

    const handleLogout = () => {
        logout();
        setActiveView(View.DASHBOARD);
        setShowSettings(false);
    };

    const handleJoinNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            const submissions = JSON.parse(localStorage.getItem('kvs_newsletter_logs') || '[]');
            if (!submissions.some((s: any) => s.email === email)) {
                submissions.push({ email, date: new Date().toISOString(), user: currentUser?.displayName });
                localStorage.setItem('kvs_newsletter_logs', JSON.stringify(submissions));
                setSubscribed(true);
                setTimeout(() => setSubscribed(false), 3000);
                setEmail('');
            } else {
                alert(lang === 'BS' ? 'Email je već prijavljen!' : 'Email is already subscribed!');
            }
        }
    };

    const translations = {
        BS: {
            appTitle: 'Maldives 2026',
            explore: 'Istraži', diveSites: 'Lokacije', crew: 'Tim', media: 'Galerija', guides: 'Vodiči', essentialInfo: 'Informacije',
            search: 'Traži...', settings: 'Postavke', nav: 'Navigacija', home: 'Početna', info: 'Informacije',
            newsletter: 'Newsletter', join: 'Pridruži se', success: 'Uspješno ste se prijavili!',
            copyright: '© 2026 KVS SCUBA Sarajevo. Sva prava zadržana. Privatni pristup zajednici.',
            darkMode: 'Tamni režim', lightMode: 'Svijetli režim', lang: 'Jezik', logout: 'Odjava',
            connectSSI: 'Poveži se na SSI / DivesSI',
            safety: 'Sigurnosni protokoli', faq: 'Česta pitanja (FAQ)', divingGuide: 'Vodič za ronioce',
            close: 'Zatvori', joinList: 'Pridruži se listi za najnovija ažuriranja.',
            shopping: { trigger: 'KUPOVINA' }
        },
        EN: {
            appTitle: 'Maldives 2026',
            explore: 'Explore', diveSites: 'Dive Sites', crew: 'The Crew', media: 'Media', guides: 'Guides', essentialInfo: 'Essential Info',
            search: 'Search...', settings: 'Settings', nav: 'Navigation', home: 'Home', info: 'Information',
            newsletter: 'Newsletter', join: 'Join', success: 'Successfully subscribed!',
            copyright: '© 2026 KVS SCUBA Sarajevo. All Rights Reserved. Private Community Access.',
            darkMode: 'Dark Mode', lightMode: 'Light Mode', lang: 'Language', logout: 'Logout',
            connectSSI: 'Connect to SSI / DivesSI',
            safety: 'Safety Protocols', faq: 'Frequently Asked Questions (FAQ)', divingGuide: 'Diving Guide',
            close: 'Close', joinList: 'Join the list for the latest updates.',
            shopping: { trigger: 'SHOPPING' }
        }
    };

    const t = translations[lang];

    if (currentRoute === '/auth') {
        return <LoginPage />;
    }

    if (currentRoute === '/auth/callback') {
        return <AuthCallback />;
    }

    if (isLoading) return null;
    if (!currentUser) return <Auth />;

    const navItems = [
        { id: View.DASHBOARD, icon: LayoutDashboard, label: t.explore },
        { id: View.ITINERARY, icon: Map, label: t.diveSites },
        { id: View.PARTICIPANTS, icon: Users, label: t.crew },
        { id: View.GALLERY, icon: Camera, label: t.media },
        { id: View.PREPARATION, icon: ClipboardList, label: t.guides },
        { id: View.GUIDES, icon: HelpCircle, label: 'Maldives' },
        { id: View.ESSENTIAL_INFO, icon: AlertCircle, label: t.essentialInfo },
    ];

    const renderView = () => {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    {(() => {
                        switch (activeView) {
                            case View.DASHBOARD: return <Dashboard lang={lang} theme={theme} />;
                            case View.ITINERARY: return <Itinerary lang={lang} theme={theme} />;
                            case View.PARTICIPANTS: return <Participants isAdmin={isAdmin} lang={lang} theme={theme} />;
                            case View.GALLERY: return <Gallery lang={lang} theme={theme} />;
                            case View.PREPARATION: return <Preparation lang={lang} theme={theme} />;
                            case View.GUIDES: return <MaldivesTripGuide lang={lang} theme={theme} />;
                            case View.ESSENTIAL_INFO: return <EssentialInfo lang={lang} theme={theme} />;
                            case View.ADMIN: return <ProtectedRoute requiredRole="admin"><Admin lang={lang} theme={theme} onLogout={handleLogout} /></ProtectedRoute>;
                            default: return <Dashboard lang={lang} theme={theme} />;
                        }
                    })()}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <>
            {/* 🔧 DIAGNOSTICS MODE */}
            {window.location.pathname === '/diagnostics' && <SystemDiagnostics />}

            {window.location.pathname !== '/diagnostics' && (
                <div className="min-h-screen flex flex-col font-sans relative">
                    <nav className={`fixed top-0 left-0 right-0 z-[100] border-b px-6 py-4 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219]/95 border-cyan-900/50' : 'bg-white/95 border-cyan-100'}`}>
                        <div className="w-full mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveView(View.DASHBOARD)} onDoubleClick={() => setActiveView(View.ADMIN)}>
                                <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain" />
                                <h1 className="app-title text-xl font-extrabold tracking-tight text-[#005f73] hidden sm:block">{t.appTitle}</h1>
                            </div>

                            <div className="hidden lg:flex items-center gap-8">
                                {navItems.map((item) => (
                                    <button key={item.id} onClick={() => setActiveView(item.id)} className={`nav-link text-base uppercase tracking-wider font-bold transition-colors ${activeView === item.id ? 'text-[#0a9396]' : (theme === 'dark' ? 'text-gray-300 hover:text-[#ee9b00]' : 'text-[#001219] hover:text-[#ee9b00]')}`}>
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`hidden md:flex items-center border rounded-full px-4 py-2 transition-colors duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-cyan-50 border-cyan-100'}`}>
                                    <Search className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                    <input type="text" placeholder={t.search} className="bg-transparent text-sm outline-none w-32 focus:w-48 transition-all" />
                                </div>

                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <button onClick={() => setActiveView(View.ADMIN)} className={`p-2 rounded-full transition-colors ${activeView === View.ADMIN ? 'text-[#005f73] bg-cyan-100' : 'text-gray-500 hover:text-[#005f73]'}`} title="Admin Panel">
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    )}
                                    <UserMenu
                                        theme={theme}
                                        onThemeChange={setTheme}
                                        lang={lang}
                                        onLanguageChange={setLang}
                                    />
                                </div>
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2">{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
                            </div>
                        </div>
                    </nav>

                    {showSettings && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                            <div className={`w-full max-w-sm rounded-[40px] p-8 relative shadow-2xl animate-in zoom-in-95 duration-500 ${theme === 'dark' ? 'bg-[#001219] border border-white/10' : 'bg-white'}`}>
                                {/* Settings content */}
                            </div>
                        </div>
                    )}

                    {activeModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                            {/* Reduced modal code for brevity */}
                        </div>
                    )}

                    {isMenuOpen && (
                        <div className={`fixed inset-0 z-[99] pt-24 px-6 animate-in slide-in-from-right duration-300 lg:hidden ${theme === 'dark' ? 'bg-[#001219]' : 'bg-white'}`}>
                            {/* Mobile menu content */}
                        </div>
                    )}

                    <main className="flex-grow pt-20">{renderView()}</main>

                    <footer id="kvsscuba" className={`py-16 px-6 border-t transition-colors duration-300 ${theme === 'dark' ? 'bg-[#000d11] text-white border-cyan-900/50' : 'bg-[#001219] text-white border-cyan-900/50'}`}>
                        {/* Footer content */}
                    </footer>
                    <ChatBot theme={theme} lang={lang} isAdmin={isAdmin} />

                    {/* Shopping Calculator Trigger & Modal */}
                    <div className="fixed bottom-40 right-5 z-[1000] flex flex-col items-end">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsShoppingOpen(true)}
                            className="bg-[#ee9b00] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/50 group"
                        >
                            <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest">{t.shopping?.trigger || 'KUPOVINA'}</span>
                        </motion.button>
                        <ShoppingCalculator
                            theme={theme}
                            isOpen={isShoppingOpen}
                            onClose={() => setIsShoppingOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

// Wrap entire app with AuthProvider at root level
const AppFinal: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default AppFinal;
