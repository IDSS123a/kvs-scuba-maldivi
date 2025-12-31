
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    X,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    RefreshCw,
    DollarSign,
    Wallet,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Theme } from '../types';
import { fetchExchangeRates, getCachedRates, ExchangeRates } from '../services/currencyService';
import '../styles/shoppingCart.css';

interface ShoppingItem {
    id: string;
    name: string;
    priceMvr: number;
}

interface Props {
    theme: Theme;
    isOpen: boolean;
    onClose: () => void;
}

const ShoppingCalculator: React.FC<Props> = ({ theme, isOpen, onClose }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [rates, setRates] = useState<ExchangeRates>(getCachedRates());
    const [loadingRates, setLoadingRates] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('kvs_shopping_cart');
        if (saved) {
            setItems(JSON.parse(saved));
        }
        updateRates();
    }, []);

    const updateRates = async () => {
        setLoadingRates(true);
        const newRates = await fetchExchangeRates();
        setRates(newRates);
        setLoadingRates(false);
    };

    const addItem = () => {
        const price = parseFloat(newItemPrice);
        if (isNaN(price) || price <= 0) return;

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: newItemName || `${t('shopping.item_name')} ${items.length + 1}`,
            priceMvr: price
        };

        setItems([...items, newItem]);
        setNewItemName('');
        setNewItemPrice('');
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('kvs_shopping_cart');
    };

    const loadCart = () => {
        const saved = localStorage.getItem('kvs_shopping_cart');
        if (saved) {
            setItems(JSON.parse(saved));
            setMessage(t('common.success') || 'Loaded!');
        } else {
            setMessage(t('shopping.empty') || 'No saved cart');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const saveCart = () => {
        localStorage.setItem('kvs_shopping_cart', JSON.stringify(items));
        setMessage(t('shopping.saved_msg'));
        setTimeout(() => setMessage(''), 3000);
    };

    const totalPriceMvr = items.reduce((sum, item) => sum + item.priceMvr, 0);
    const totalPriceUsd = totalPriceMvr * rates.USD;
    const totalPriceBam = totalPriceMvr * rates.BAM;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-[#001219] border border-white/10' : 'bg-white border border-cyan-100'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`p-6 md:p-8 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#ee9b00] rounded-2xl shadow-lg shadow-amber-500/20">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight">{t('shopping.title')}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-cyan-400' : 'text-[#0a9396]'}`}>
                                            MVR → USD & BAM
                                        </span>
                                        {loadingRates && <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
                            {/* Input Form */}
                            <div className={`p-6 rounded-[32px] space-y-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-cyan-50/50 border border-cyan-100/50'
                                }`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                                            {t('shopping.item_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder={t('shopping.item_name_placeholder')}
                                            className="input-theme"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                                            {t('shopping.price_mvr')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newItemPrice}
                                                onChange={(e) => setNewItemPrice(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                                placeholder="0.00"
                                                className="input-theme pr-16"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-xs opacity-40">MVR</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={addItem}
                                    className="w-full btn-primary flex items-center justify-center gap-2 group"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    {t('shopping.add')}
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {items.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center">
                                        <ShoppingCart className="w-16 h-16 mb-4" />
                                        <p className="font-black uppercase tracking-widest text-sm">{t('shopping.empty')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={item.id}
                                                className={`p-5 rounded-3xl flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/5 hover:border-white/10' : 'bg-white border border-gray-100 hover:border-cyan-200 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <h4 className="font-bold truncate">{item.name}</h4>
                                                    <div className="flex gap-4 mt-1">
                                                        <span className="text-xs font-black text-[#0a9396]">{item.priceMvr.toFixed(2)} MVR</span>
                                                        <span className="text-xs font-bold text-gray-400">≈ ${(item.priceMvr * rates.USD).toFixed(2)}</span>
                                                        <span className="text-xs font-bold text-gray-400">≈ {(item.priceMvr * rates.BAM).toFixed(2)} KM</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Summary */}
                        <div className={`p-8 md:p-10 space-y-6 border-t ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-cyan-50/30 border-cyan-100'
                            }`}>
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Amount</p>
                                    <div className="flex flex-wrap items-baseline gap-4 md:gap-8">
                                        <div className="text-3xl md:text-4xl font-black tracking-tight text-[#005f73]">
                                            ${totalPriceUsd.toFixed(2)}
                                            <span className="text-sm ml-2 opacity-60 font-black uppercase">USD</span>
                                        </div>
                                        <div className="text-2xl md:text-3xl font-black tracking-tight text-[#ee9b00]">
                                            {totalPriceBam.toFixed(2)}
                                            <span className="text-sm ml-2 opacity-60 font-black uppercase tracking-widest">BAM</span>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold opacity-40 mt-2">
                                        {totalPriceMvr.toFixed(2)} MVR • {new Date(rates.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Update
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={loadCart}
                                        className={`p-4 rounded-3xl transition-all hover:bg-cyan-500 hover:text-white ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-400 border border-gray-100'
                                            }`}
                                        title={t('shopping.load')}
                                    >
                                        <RotateCcw className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className={`p-4 rounded-3xl transition-all hover:bg-red-500 hover:text-white ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-white text-gray-400 border border-gray-100'
                                            }`}
                                        title={t('shopping.clear')}
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={saveCart}
                                        className="btn-primary !px-6 flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span className="hidden sm:inline">{t('shopping.save')}</span>
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {message}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShoppingCalculator;
