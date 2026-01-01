
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { signUpForAccess } from '../services/authService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AccessRequestFormProps {
    onRequestSubmitted?: () => void;
    onBackToLogin?: () => void;
    lang?: 'bs' | 'en';
    showBackButton?: boolean;
    isInline?: boolean;
}

export const AccessRequestForm: React.FC<AccessRequestFormProps> = ({
    onRequestSubmitted,
    onBackToLogin,
    lang = 'en',
    showBackButton = true,
    isInline = false
}) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const messages = {
        bs: {
            title: 'Zahtjev za Pristup',
            subtitle: 'Ispunite obraz da biste zatražili pristup ekspediciji',
            fullName: 'Puno Ime',
            email: 'Email Adresa',
            phone: 'Telefonski Broj (opcionalno)',
            submit: 'Pošalji Zahtjev',
            submitting: 'Slanje...',
            success: 'Vaš zahtjev je poslan!',
            successMsg: 'Organizatori ekspedicije će vas kontaktirati na e-mail s vašim PIN kodom za pristup.',
            errorRequired: 'Ime i e-mail su obavezni.',
            errorEmail: 'Molimo unesite valjanu email adresu.',
            errorSubmit: 'Greška pri slanju zahtjeva. Pokušajte ponovo.',
            backendError: 'Greška:',
        },
        en: {
            title: 'Request Access',
            subtitle: 'Fill out the form to request expedition access',
            fullName: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number (optional)',
            submit: 'Submit Request',
            submitting: 'Submitting...',
            success: 'Your Request Was Sent!',
            successMsg: 'The expedition organizers will contact you via email with your 6-digit access PIN.',
            errorRequired: 'Name and email are required.',
            errorEmail: 'Please enter a valid email address.',
            errorSubmit: 'Error submitting request. Please try again.',
            backendError: 'Error:',
        }
    };

    const t = messages[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName.trim() || !email.trim()) {
            setError(t.errorRequired);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t.errorEmail);
            return;
        }

        setLoading(true);
        const normalizedEmail = email.toLowerCase().trim();

        try {
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id, status, email')
                .eq('email', normalizedEmail)
                .maybeSingle();

            if (checkError) {
                setError('Error checking existing users. Please try again.');
                setLoading(false);
                return;
            }

            if (existingUser) {
                if (existingUser.status === 'pending') {
                    setError('⚠️ You already have a pending request. Please wait for administrator approval.');
                } else if (existingUser.status === 'approved') {
                    setError('✅ Your account is already approved! Check your email for the PIN code.');
                } else if (existingUser.status === 'active') {
                    setError('✅ Your account is already active. Please use the PIN login.');
                } else if (existingUser.status === 'rejected') {
                    setError('❌ Your request was rejected. Contact the administrator for more information.');
                } else {
                    setError('This email is already registered.');
                }
                setLoading(false);
                return;
            }

            const result = await signUpForAccess({
                email: normalizedEmail,
                full_name: fullName.trim(),
                password: Math.random().toString(36).slice(-12)
            });

            if (result.error) {
                if (result.error.includes('already registered') || result.error.includes('23505')) {
                    setError('⚠️ This email is already registered. Please use a different email or contact administrator.');
                } else {
                    setError(t.errorSubmit + ': ' + result.error);
                }
                setLoading(false);
                return;
            }

            if (phone.trim() && result.user?.id) {
                await supabase
                    .from('users')
                    .update({ phone: phone.trim() })
                    .eq('id', result.user.id);
            }

            setSuccess(true);

            setTimeout(() => {
                setFullName('');
                setEmail('');
                setPhone('');
                setSuccess(false);
                onRequestSubmitted?.();
            }, 3000);

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : t.errorSubmit;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isInline ? (
                <>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-green-400 mb-2">
                                    {t.success}
                                </h2>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {t.successMsg}
                                </p>
                            </div>
                            <div className="pt-2">
                                <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="flex gap-3 p-3 bg-red-900/30 rounded-lg border border-red-700">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-300">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t.fullName} *
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition disabled:opacity-50 text-sm"
                                    placeholder="e.g., Davor Mulalić"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t.email} *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition disabled:opacity-50 text-sm"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t.phone}
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition disabled:opacity-50 text-sm"
                                    placeholder="+387 61 123 4567"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t.submitting}
                                    </>
                                ) : (
                                    t.submit
                                )}
                            </button>

                            <p className="text-[10px] text-center text-gray-400">
                                {lang === 'bs'
                                    ? 'Vaš zahtjev će biti pregledan od strane organizatora ekspedicije.'
                                    : 'Your request will be reviewed by the expedition organizers.'}
                            </p>
                        </form>
                    )}
                </>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-300 mb-2">
                                🤿 KVS-SCUBA
                            </h1>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t.subtitle}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
                            {success ? (
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-green-600 dark:text-green-400 mb-2">
                                            {t.success}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {t.successMsg}
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-cyan-600 mx-auto" />
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-[15px] border border-red-200 dark:border-red-800">
                                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {t.fullName} *
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            disabled={loading}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[12px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900 transition disabled:opacity-50"
                                            placeholder="e.g., Davor Mulalić"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {t.email} *
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[12px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900 transition disabled:opacity-50"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {t.phone}
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={loading}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-[12px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900 transition disabled:opacity-50"
                                            placeholder="+387 61 123 4567"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded-[15px] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {t.submitting}
                                            </>
                                        ) : (
                                            t.submit
                                        )}
                                    </button>

                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        {lang === 'bs'
                                            ? 'Vaš zahtjev će biti pregledan od strane organizatora ekspedicije.'
                                            : 'Your request will be reviewed by the expedition organizers.'}
                                    </p>

                                    {showBackButton && onBackToLogin && (
                                        <button
                                            type="button"
                                            onClick={onBackToLogin}
                                            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-[15px] font-bold transition"
                                        >
                                            {lang === 'bs' ? 'Nazad na Login' : 'Back to Login'}
                                        </button>
                                    )}
                                </form>
                            )}
                        </div>

                        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                            <p>{lang === 'bs' ? 'KVS-SCUBA Ekspedicija Maldivi 2026' : 'KVS-SCUBA Maldives 2026 Expedition'}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
