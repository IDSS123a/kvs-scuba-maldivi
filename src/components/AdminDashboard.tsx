
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { hashPin } from '../utils/pinCrypto';

import {
    Users,
    UserCheck,
    UserX,
    DollarSign,
    FileText,
    Settings,
    LogOut,
    Plus,
    Edit2,
    Trash2,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Copy,
    Download,
    Loader2,
    Eye,
    EyeOff,
    Shield,
    Clock
} from 'lucide-react';

interface Diver {
    id: string;
    name: string;
    email: string;
    phone?: string;
    is_pro: boolean;
    access_status: 'pending' | 'approved' | 'revoked';
    access_pin_hash?: string;
    last_login?: string;
    status?: string;
    total_dives?: number;
}

interface Payment {
    id: string;
    name: string;
    paid_to_agency: number;
    paid_to_adnan: number;
    add_for_kids?: number;
    payment_date?: string;
    status?: string;
}

interface AdminDashboardProps {
    user: Diver;
    onLogout?: () => void;
    lang?: 'bs' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    user,
    onLogout,
    lang = 'en'
}) => {
    const [tab, setTab] = useState<'access' | 'members' | 'finance' | 'system'>('access');
    const [pendingRequests, setPendingRequests] = useState<Diver[]>([]);
    const [members, setMembers] = useState<Diver[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [generatedPins, setGeneratedPins] = useState<Record<string, string>>({});
    const [editingMember, setEditingMember] = useState<Diver | null>(null);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    const messages = {
        bs: {
            accessRequests: 'Zahtjevi za Pristup',
            members: 'Članovi Ekspedicije',
            finance: 'Financije',
            system: 'Sustav',
            pendingRequests: 'Zahtjevi u Čekanju',
            noRequests: 'Nema zahtjeva za pristup.',
            approve: 'Odobri',
            deny: 'Odbij',
            memberManagement: 'Upravljanje Članovima',
            edit: 'Uredi',
            delete: 'Obriši',
            newMember: 'Novi Član',
            makeAdmin: 'Učini Amministratorom',
            revokeAccess: 'Uništi Pristup',
            regeneratePin: 'Regeneriraj PIN',
            financeHub: 'Centar za Financije',
            totalCollected: 'Ukupno Prikupljeno',
            agency: 'Agencija',
            cash: 'Gotovina',
            exportCsv: 'Preuzmi CSV',
            supabaseStatus: 'Status Supabase',
            pinGenerated: 'PIN Generirano',
            copied: 'Kopirano u međuspremnik!',
            confirmDelete: 'Jeste li sigurni da želite izbrisati?',
            logout: 'Odjava',
            loading: 'Učitavanje...',
            error: 'Greška',
            success: 'Uspješno!',
        },
        en: {
            accessRequests: 'Access Requests',
            members: 'Expedition Members',
            finance: 'Finance',
            system: 'System',
            pendingRequests: 'Pending Requests',
            noRequests: 'No pending access requests.',
            approve: 'Approve',
            deny: 'Deny',
            memberManagement: 'Member Management',
            edit: 'Edit',
            delete: 'Delete',
            newMember: 'New Member',
            makeAdmin: 'Make Admin',
            revokeAccess: 'Revoke Access',
            regeneratePin: 'Regenerate PIN',
            financeHub: 'Finance Hub',
            totalCollected: 'Total Collected',
            agency: 'Agency',
            cash: 'Cash',
            exportCsv: 'Export CSV',
            supabaseStatus: 'Supabase Status',
            pinGenerated: 'PIN Generated',
            copied: 'Copied to clipboard!',
            confirmDelete: 'Are you sure you want to delete?',
            logout: 'Logout',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success!',
        }
    };

    const t = messages[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: pending, error: pendingErr } = await supabase
                .from('users')
                .select('*')
                .eq('status', 'pending');

            if (pendingErr) throw pendingErr;

            const mappedPending = (pending || []).map(p => ({
                ...p,
                access_status: p.status as any
            }));
            setPendingRequests(mappedPending);

            const { data: allMembers, error: membersErr } = await supabase
                .from('users')
                .select('*')
                .order('name');

            if (membersErr) throw membersErr;

            const mappedMembers = (allMembers || []).map(m => ({
                ...m,
                access_status: m.status as any,
                is_pro: m.role === 'admin'
            }));
            setMembers(mappedMembers);

            const { data: paymentData, error: paymentErr } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (paymentErr) throw paymentErr;

            const mappedPayments = (paymentData || []).map(p => ({
                id: p.id,
                name: p.diver_name || 'Unknown',
                paid_to_agency: Number(p.paid_to_agency || 0),
                paid_to_adnan: Number(p.paid_to_adnana || 0),
                add_for_kids: Number(p.add_for_kids || 0),
                payment_date: p.payment_date,
                status: p.status
            }));

            setPayments(mappedPayments);

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load data';
            setError(msg);
            console.error('Load data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (diver: Diver) => {
        try {
            let pin;
            let attempts = 0;

            do {
                pin = Math.floor(100000 + Math.random() * 900000).toString();
                const { data: existing, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('pin_code', pin)
                    .limit(1);

                if (checkError) throw checkError;

                if (!existing || existing.length === 0) break;

                attempts++;
                if (attempts > 20) throw new Error('Cannot generate unique PIN');
            } while (true);

            const { error: updateErr, data: updateData } = await supabase
                .from('users')
                .update({
                    pin_code: pin,
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', diver.id)
                .select('id, pin_code, status, name, email');

            if (updateErr) throw updateErr;

            let verification: any = null;
            if (updateData && updateData.length > 0) {
                verification = updateData[0];
            } else {
                const { data: selectData, error: selectErr } = await supabase
                    .from('users')
                    .select('id, pin_code, status, name, email')
                    .eq('id', diver.id)
                    .maybeSingle();

                if (selectErr) throw selectErr;
                if (!selectData) throw new Error('User not found after PIN update');
                verification = selectData;
            }

            if (verification?.pin_code !== pin) throw new Error('PIN verification failed after save');

            setGeneratedPins(prev => ({ ...prev, [diver.id]: pin }));
            setSuccess(`PIN for ${diver.name}: ${pin}`);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve request');
            console.error('Approve request error:', err);
        }
    };

    const handleDenyRequest = async (diverId: string) => {
        try {
            const { error: updateErr } = await supabase
                .from('divers')
                .update({ access_status: 'revoked' })
                .eq('id', diverId);

            if (updateErr) throw updateErr;
            setSuccess(t.success);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deny request');
        }
    };

    const handleRegeneratePin = async (diver: Diver) => {
        try {
            let pin;
            let attempts = 0;

            do {
                pin = Math.floor(100000 + Math.random() * 900000).toString();
                const { data: existing, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('pin_code', pin)
                    .limit(1);

                if (checkError) throw checkError;

                if (!existing || existing.length === 0) break;

                attempts++;
                if (attempts > 20) throw new Error('Cannot generate unique PIN');
            } while (true);

            const { error: updateErr, data: updateData } = await supabase
                .from('users')
                .update({
                    pin_code: pin,
                    updated_at: new Date().toISOString()
                })
                .eq('id', diver.id)
                .select('id, pin_code');

            if (updateErr) throw updateErr;

            let verification: any = null;
            if (updateData && updateData.length > 0) {
                verification = updateData[0];
            } else {
                const { data: selectData, error: selectErr } = await supabase
                    .from('users')
                    .select('id, pin_code')
                    .eq('id', diver.id)
                    .maybeSingle();

                if (selectErr) throw selectErr;
                if (!selectData) throw new Error('User not found after PIN update');
                verification = selectData;
            }

            if (verification?.pin_code !== pin) throw new Error('New PIN verification failed after save');

            setGeneratedPins(prev => ({ ...prev, [diver.id]: pin }));
            setSuccess(`New PIN for ${diver.name}: ${pin}`);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate PIN');
            console.error('Regenerate PIN error:', err);
        }
    };

    const handleToggleAdmin = async (diverId: string, isCurrentlyAdmin: boolean) => {
        try {
            const { error: updateErr } = await supabase
                .from('divers')
                .update({ is_pro: !isCurrentlyAdmin })
                .eq('id', diverId);

            if (updateErr) throw updateErr;
            setSuccess(t.success);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update admin status');
        }
    };

    const handleDeleteMember = async (diverId: string) => {
        if (!window.confirm(t.confirmDelete)) return;

        try {
            const { error: deleteErr } = await supabase
                .from('divers')
                .delete()
                .eq('id', diverId);

            if (deleteErr) throw deleteErr;
            setSuccess(t.success);
            loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete member');
        }
    };

    const exportCsv = () => {
        const headers = ['Name', 'Email', 'Status', 'Admin'];
        const rows = members.map(m => [
            m.name,
            m.email,
            m.access_status,
            m.is_pro ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kvs-members-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccess(t.copied);
    };

    const calculateFinancials = () => {
        let total = 0, agency = 0, cash = 0;
        payments.forEach(p => {
            const a = Number(p.paid_to_agency) || 0;
            const c = (Number(p.paid_to_adnan) || 0) + (Number(p.add_for_kids) || 0);
            total += a + c;
            agency += a;
            cash += c;
        });
        return { total, agency, cash };
    };

    const financials = calculateFinancials();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-black/50 border-b border-cyan-500/20 sticky top-0 z-50 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-cyan-400 flex items-center gap-3">
                            <Shield className="w-7 h-7" /> ADMIN HUB
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Logged in as: <span className="font-semibold text-cyan-300">{user.name}</span></p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                    >
                        <LogOut className="w-4 h-4" /> {t.logout}
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/50 border-b border-gray-700 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {(['access', 'members', 'finance', 'system'] as const).map((tabName) => {
                            const icons = {
                                access: <UserCheck className="w-4 h-4" />,
                                members: <Users className="w-4 h-4" />,
                                finance: <DollarSign className="w-4 h-4" />,
                                system: <Settings className="w-4 h-4" />
                            };

                            const labels = {
                                access: t.accessRequests,
                                members: t.members,
                                finance: t.finance,
                                system: t.system
                            };

                            return (
                                <button
                                    key={tabName}
                                    onClick={() => setTab(tabName)}
                                    className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 transition border-b-2 ${tab === tabName
                                        ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    {icons[tabName]}
                                    {labels[tabName]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-green-300 text-sm">{success}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {tab === 'access' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <UserCheck className="w-6 h-6 text-cyan-400" /> {t.accessRequests}
                                </h2>

                                {pendingRequests.length === 0 ? (
                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                                        <p className="text-gray-400">{t.noRequests}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-white">{req.name}</p>
                                                    <p className="text-sm text-gray-400">{req.email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveRequest(req)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition"
                                                    >
                                                        {t.approve}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDenyRequest(req.id)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm transition"
                                                    >
                                                        {t.deny}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {Object.keys(generatedPins).length > 0 && (
                                    <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4 space-y-2">
                                        <p className="font-semibold text-cyan-300">Generated PINs (Share Securely)</p>
                                        {Object.entries(generatedPins).map(([diverId, pin]) => {
                                            const member = members.find((m: any) => m.id === diverId);
                                            return (
                                                <div key={diverId} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                                                    <div>
                                                        <p className="text-white font-mono text-lg">{pin}</p>
                                                        <p className="text-xs text-gray-400">{member?.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(pin as string)}
                                                        className="p-2 bg-gray-700 hover:bg-600 rounded transition"
                                                    >
                                                        <Copy className="w-4 h-4 text-cyan-400" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'members' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <Users className="w-6 h-6 text-cyan-400" /> {t.memberManagement}
                                    </h2>
                                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center gap-2 transition">
                                        <Plus className="w-4 h-4" /> {t.newMember}
                                    </button>
                                </div>

                                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-700/50 border-b border-gray-600">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Name</th>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Email</th>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Admin</th>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {members.map(member => (
                                                    <tr key={member.id} className="hover:bg-gray-700/50 transition">
                                                        <td className="px-4 py-3 text-white font-semibold">{member.name}</td>
                                                        <td className="px-4 py-3 text-gray-400 text-xs">{member.email}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${member.access_status === 'approved'
                                                                ? 'bg-green-900/50 text-green-300'
                                                                : 'bg-yellow-900/50 text-yellow-300'
                                                                }`}>
                                                                {member.access_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${member.is_pro
                                                                ? 'bg-purple-900/50 text-purple-300'
                                                                : 'bg-gray-700 text-gray-300'
                                                                }`}>
                                                                {member.is_pro ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 flex gap-2">
                                                            <button
                                                                onClick={() => handleRegeneratePin(member)}
                                                                title={t.regeneratePin}
                                                                className="p-2 bg-gray-700 hover:bg-blue-600 rounded transition"
                                                            >
                                                                <RefreshCw className="w-4 h-4 text-blue-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleAdmin(member.id, member.is_pro)}
                                                                title={member.is_pro ? t.revokeAccess : t.makeAdmin}
                                                                className="p-2 bg-gray-700 hover:bg-purple-600 rounded transition"
                                                            >
                                                                <Shield className="w-4 h-4 text-purple-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMember(member.id)}
                                                                title={t.delete}
                                                                className="p-2 bg-gray-700 hover:bg-red-600 rounded transition"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'finance' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                                        <DollarSign className="w-6 h-6 text-cyan-400" /> {t.financeHub}
                                    </h2>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 border border-cyan-700 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-gray-300 uppercase mb-2">{t.totalCollected}</p>
                                            <p className="text-3xl font-black text-cyan-300">{financials.total.toFixed(0)}€</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-700 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-gray-300 uppercase mb-2">{t.agency}</p>
                                            <p className="text-3xl font-black text-amber-300">{financials.agency.toFixed(0)}€</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700 rounded-lg p-4">
                                            <p className="text-xs font-semibold text-gray-300 uppercase mb-2">{t.cash}</p>
                                            <p className="text-3xl font-black text-emerald-300">{financials.cash.toFixed(0)}€</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-700/50 border-b border-gray-600">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Member</th>
                                                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">Agency</th>
                                                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">Cash</th>
                                                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {payments.map(payment => (
                                                    <tr key={payment.id} className="hover:bg-gray-700/50 transition">
                                                        <td className="px-4 py-3 text-white font-semibold">{payment.name}</td>
                                                        <td className="px-4 py-3 text-right text-amber-300">{payment.paid_to_agency.toFixed(0)}€</td>
                                                        <td className="px-4 py-3 text-right text-emerald-300">{payment.paid_to_adnan.toFixed(0)}€</td>
                                                        <td className="px-4 py-3 text-right text-cyan-300 font-semibold">
                                                            {(payment.paid_to_agency + payment.paid_to_adnan).toFixed(0)}€
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'system' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Settings className="w-6 h-6 text-cyan-400" /> {t.system}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={loadData}
                                        className="p-4 bg-gray-800 border border-gray-700 hover:border-cyan-600 rounded-lg transition flex items-center gap-3 text-left"
                                    >
                                        <RefreshCw className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-white">{lang === 'bs' ? 'Osvježi Podatke' : 'Refresh Data'}</p>
                                            <p className="text-xs text-gray-400">{lang === 'bs' ? 'Učitaj najnovije podatke' : 'Load latest data'}</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={exportCsv}
                                        className="p-4 bg-gray-800 border border-gray-700 hover:border-cyan-600 rounded-lg transition flex items-center gap-3 text-left"
                                    >
                                        <Download className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-white">{t.exportCsv}</p>
                                            <p className="text-xs text-gray-400">{lang === 'bs' ? 'Preuzmi listu članova' : 'Download member list'}</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
