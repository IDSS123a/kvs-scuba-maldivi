
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { Edit2, Save, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface Payment {
    id: string;
    diver_id: string;
    diver_name: string;
    paid_to_agency: number;
    paid_to_adnana: number;
    add_for_kids: number;
    amount_eur: number;
    status: 'pending' | 'completed' | 'partial';
    payment_method: string;
    payment_date: string;
    payment_purpose: string;
    note: string;
    created_at?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface PaymentManagerProps {
    lang?: Language;
    onUpdate?: () => void;
    divers?: any[]; // For compatibility
    payments?: any[]; // For compatibility
    theme?: string;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({ lang = 'BS', onUpdate }) => {
    const { isAdmin } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Payment>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    const t = translations[lang];

    const [totals, setTotals] = useState({
        agency: 0,
        adnana: 0,
        kids: 0,
        grandTotal: 0
    });

    const [newPayment, setNewPayment] = useState({
        diver_id: '',
        diver_name: '',
        paid_to_agency: 0,
        paid_to_adnana: 0,
        add_for_kids: 0,
        status: 'completed' as const,
        payment_purpose: 'Predračun br. 916/12-25'
    });

    useEffect(() => {
        if (!isAdmin) return;
        loadPaymentData();
    }, [isAdmin]);

    const loadPaymentData = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, name, email')
                .order('name');

            if (usersError) throw usersError;
            setUsers(usersData || []);

            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (paymentsError) throw paymentsError;

            const formattedPayments = (paymentsData || []).map(p => ({
                ...p,
                paid_to_agency: Number(p.paid_to_agency || 0),
                paid_to_adnana: Number(p.paid_to_adnana || 0),
                add_for_kids: Number(p.add_for_kids || 0),
                amount_eur: Number(p.amount_eur || 0)
            }));

            setPayments(formattedPayments);

            const newTotals = formattedPayments.reduce((acc, p) => ({
                agency: acc.agency + p.paid_to_agency,
                adnana: acc.adnana + p.paid_to_adnana,
                kids: acc.kids + p.add_for_kids,
                grandTotal: acc.grandTotal + p.amount_eur
            }), { agency: 0, adnana: 0, kids: 0, grandTotal: 0 });

            setTotals(newTotals);

        } catch (err) {
            console.error('[PaymentManager] Error:', err);
            setError('Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (payment: Payment) => {
        setEditingId(payment.id);
        setEditValues(payment);
    };

    const handleSave = async () => {
        if (!editingId || !editValues) return;

        try {
            const total = (Number(editValues.paid_to_agency) || 0) +
                (Number(editValues.paid_to_adnana) || 0) +
                (Number(editValues.add_for_kids) || 0);

            const { error } = await supabase
                .from('payments')
                .update({
                    paid_to_agency: editValues.paid_to_agency,
                    paid_to_adnana: editValues.paid_to_adnana,
                    add_for_kids: editValues.add_for_kids,
                    amount_eur: total,
                    status: editValues.status,
                    note: editValues.note,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingId);

            if (error) throw error;

            loadPaymentData();
            onUpdate?.();
            setEditingId(null);
            setEditValues({});
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to update payment');
        }
    };

    const handleAddPayment = async () => {
        if (!newPayment.diver_id) {
            setError('Please select a diver');
            return;
        }

        try {
            const selectedUser = users.find(u => u.id === newPayment.diver_id);
            const total = Number(newPayment.paid_to_agency) +
                Number(newPayment.paid_to_adnana) +
                Number(newPayment.add_for_kids);

            const { error } = await supabase
                .from('payments')
                .insert([{
                    diver_id: newPayment.diver_id,
                    diver_name: selectedUser?.name || 'Unknown',
                    paid_to_agency: newPayment.paid_to_agency,
                    paid_to_adnana: newPayment.paid_to_adnana,
                    add_for_kids: newPayment.add_for_kids,
                    amount_eur: total,
                    status: newPayment.status,
                    payment_purpose: newPayment.payment_purpose,
                    payment_method: 'mixed',
                    payment_date: new Date().toISOString().split('T')[0]
                }]);

            if (error) throw error;

            loadPaymentData();
            onUpdate?.();
            setShowAddForm(false);
            setNewPayment({
                diver_id: '',
                diver_name: '',
                paid_to_agency: 0,
                paid_to_adnana: 0,
                add_for_kids: 0,
                status: 'completed',
                payment_purpose: 'Predračun br. 916/12-25'
            });
        } catch (err) {
            console.error('Add error:', err);
            setError('Failed to add payment');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.totalCollected}</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{totals.grandTotal.toLocaleString()} €</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.agency}</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totals.agency.toLocaleString()} €</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.cash}</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{(totals.adnana + totals.kids).toLocaleString()} €</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.forKids || 'Kids'}</p>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totals.kids.toLocaleString()} €</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-bold border border-red-100">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {!showAddForm && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <Plus className="w-4 h-4" /> {t.btnRecordPayment}
                </button>
            )}

            {showAddForm && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-black dark:text-white uppercase tracking-wider text-sm">{t.addPaymentTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t.diverPayer}</label>
                            <select
                                value={newPayment.diver_id}
                                onChange={(e) => setNewPayment({ ...newPayment, diver_id: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
                            >
                                <option value="">{t.selectDiver}</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t.paidToAgency}</label>
                            <input
                                type="number"
                                value={newPayment.paid_to_agency}
                                onChange={(e) => setNewPayment({ ...newPayment, paid_to_agency: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t.paidToLocal}</label>
                            <input
                                type="number"
                                value={newPayment.paid_to_adnana}
                                onChange={(e) => setNewPayment({ ...newPayment, paid_to_adnana: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white font-mono"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAddPayment} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs">{t.btnSavePayment}</button>
                        <button onClick={() => setShowAddForm(false)} className="px-6 py-3 bg-gray-400 text-white rounded-xl font-black uppercase text-xs">{t.btnCancel}</button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {payments.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                        {editingId === p.id ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">{t.agency}</label>
                                        <input
                                            type="number"
                                            value={editValues.paid_to_agency}
                                            onChange={(e) => setEditValues({ ...editValues, paid_to_agency: Number(e.target.value) })}
                                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400">{t.cash}</label>
                                        <input
                                            type="number"
                                            value={editValues.paid_to_adnana}
                                            onChange={(e) => setEditValues({ ...editValues, paid_to_adnana: Number(e.target.value) })}
                                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                        <Save className="w-3 h-3" /> Save
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-400 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                        <X className="w-3 h-3" /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {p.diver_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">{p.diver_name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(p.created_at || '').toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-black text-lg text-emerald-600 dark:text-emerald-400">{p.amount_eur} €</p>
                                    <div className="flex gap-2 justify-end">
                                        {p.paid_to_agency > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">Ag: {p.paid_to_agency}</span>}
                                        {p.paid_to_adnana > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">Cash: {p.paid_to_adnana}</span>}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleEdit(p)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-500 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {payments.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No payments recorded
                    </div>
                )}
            </div>
        </div>
    );
};
