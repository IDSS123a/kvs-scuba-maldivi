import React, { useState } from 'react';
import ShoppingCalculator from './components/ShoppingCalculator.tsx';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthProvider.tsx';

// --- INLINE TIPOVI ---
export type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
    const [isShoppingOpen, setIsShoppingOpen] = useState(false);
    const theme: Theme = 'light';

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 to-blue-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg p-12 rounded-3xl shadow-2xl max-w-lg text-center border border-white/20 text-white">
                <h1 className="text-4xl font-black mb-6 tracking-tight">MALDIVES 2026</h1>
                <p className="text-lg opacity-80 mb-8">
                    Sistem se ažurira. Molimo sačekajte.
                </p>
                <div className="p-6 bg-amber-500/20 border border-amber-500/40 rounded-xl animate-pulse">
                    <p className="font-bold text-amber-300">
                        🛒 SHOPPING PREVIEW JE SPREMAN!
                    </p>
                    <p className="text-sm mt-2 opacity-70">Kliknite na dugme u donjem desnom uglu.</p>
                </div>
            </div>

            {/* Shopping Calculator Trigger & Modal */}
            <div className="fixed bottom-10 right-6 z-[1000] flex flex-col items-end">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsShoppingOpen(true)}
                    className="bg-[#ee9b00] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/50 group"
                >
                    <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">KUPOVINA</span>
                </motion.button>
                <ShoppingCalculator
                    theme={theme}
                    isOpen={isShoppingOpen}
                    onClose={() => setIsShoppingOpen(false)}
                />
            </div>
        </div>
    );
};

// Wrap with provider to be safe
const AppFinal: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default AppFinal;
