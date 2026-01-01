
import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface RequestConfirmationProps {
    lang?: 'bs' | 'en';
    onBackToLogin: () => void;
}

export const RequestConfirmation: React.FC<RequestConfirmationProps> = ({
    lang = 'en',
    onBackToLogin
}) => {
    const messages = {
        bs: {
            title: 'Zahtjev Primljen!',
            subtitle: 'Hvala na vašoj prijavi',
            message: 'Vaš zahtjev za pristup ekspediciji je uspješno primljen. Tim organizatora će pregledati vašu prijavu i kontaktirati vas na e-mail ili telefonski broj koji ste unijeli sa vašim PIN kodom za pristup.',
            nextSteps: 'Što se dalje?',
            step1: 'Provjerite vašu e-mail poruku (ili spam folder)',
            step2: 'Organizer će vas kontaktirati sa 6-znamenkastim PIN kodom',
            step3: 'Vratite se na login ekran i unesite PIN za pristup',
            backButton: 'Nazad na Login',
            timeline: 'Obično biste trebali dobiti PIN u roku od 24 sata.',
        },
        en: {
            title: 'Request Received!',
            subtitle: 'Thank you for your application',
            message: 'Your request to access the expedition has been successfully submitted. Our team will review your application and contact you at the email address or phone number you provided with your 6-digit access PIN.',
            nextSteps: 'What\'s Next?',
            step1: 'Check your email inbox (or spam folder)',
            step2: 'Our team will contact you with your 6-digit access PIN',
            step3: 'Return to the login screen and enter your PIN to access',
            backButton: 'Back to Login',
            timeline: 'You should typically receive your PIN within 24 hours.',
        }
    };

    const t = messages[lang];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                        🤿 KVS-SCUBA
                    </h1>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t.subtitle}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse" />
                            <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400 relative z-10" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-center text-green-600 dark:text-green-400 mb-4">
                        {t.title}
                    </h2>

                    <p className="text-center text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        {t.message}
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[12px] p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                            ⏱️ {t.timeline}
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-center">
                            {t.nextSteps}
                        </h3>
                        <ol className="space-y-3">
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                                    1
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">
                                    {t.step1}
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                                    2
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">
                                    {t.step2}
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                                    3
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">
                                    {t.step3}
                                </span>
                            </li>
                        </ol>
                    </div>

                    <button
                        onClick={onBackToLogin}
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-[15px] font-bold transition flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t.backButton}
                    </button>
                </div>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>{lang === 'bs' ? 'KVS-SCUBA Ekspedicija Maldivi 2026' : 'KVS-SCUBA Maldives 2026 Expedition'}</p>
                </div>
            </div>
        </div>
    );
};
