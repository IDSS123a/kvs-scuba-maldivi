
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { verifyPin, createAuditLog } from '../services/pinService';

interface PINVerificationFormProps {
    onSuccess?: (userId: string, userName: string) => void;
    onBackToRequest?: () => void;
    lang?: 'bs' | 'en';
}

export const PINVerificationForm: React.FC<PINVerificationFormProps> = ({
    onSuccess,
    onBackToRequest,
    lang = 'en'
}) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const messages = {
        bs: {
            title: 'Unesite PIN',
            subtitle: 'Unesite 6-znamenkasti PIN koji ste primili',
            pinLabel: 'PIN Kod',
            submit: 'Potvrdi PIN',
            submitting: 'Provjera...',
            success: 'Pristup Odobren! ✅',
            successMsg: 'Dobrodošli! Sada možete pristupiti aplikaciji.',
            invalidPin: 'Neispravan PIN. Pokušajte ponovo.',
            lockout: 'Previše pokušaja. Pokušajte ponovo za 5 minuta.',
            error: 'Greška pri provjeri PIN-a. Pokušajte ponovo.',
            back: 'Zatraži Pristup',
        },
        en: {
            title: 'Enter PIN',
            subtitle: 'Enter the 6-digit PIN you received',
            pinLabel: 'PIN Code',
            submit: 'Verify PIN',
            submitting: 'Verifying...',
            success: 'Access Granted! ✅',
            successMsg: 'Welcome! You can now access the application.',
            invalidPin: 'Invalid PIN. Please try again.',
            lockout: 'Too many attempts. Please try again in 5 minutes.',
            error: 'Error verifying PIN. Please try again.',
            back: 'Request Access',
        }
    };

    const t = messages[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!pin.trim() || pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }

        setLoading(true);

        try {
            const user = await verifyPin(pin);

            if (!user) {
                setError(t.invalidPin);
                setAttempts(prev => prev + 1);
                setLoading(false);
                return;
            }

            await createAuditLog(user.id, 'pin_verified', {
                method: 'pin_entry',
                timestamp: new Date().toISOString()
            });

            setSuccess(true);

            setTimeout(() => {
                onSuccess?.(user.id, user.name);
            }, 1500);

        } catch (err) {
            console.error('❌ Error:', err);
            setError(t.error);
            setAttempts(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.success}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{t.successMsg}</p>
                    <div className="mt-6">
                        <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        🔐 {t.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {attempts > 0 && attempts < 5 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Attempt {attempts}/5
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {t.pinLabel}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            disabled={loading || attempts >= 5}
                            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition disabled:opacity-50"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || attempts >= 5}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
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

                    {onBackToRequest && (
                        <button
                            type="button"
                            onClick={onBackToRequest}
                            className="w-full py-2 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t.back}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PINVerificationForm;
