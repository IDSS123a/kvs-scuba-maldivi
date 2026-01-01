
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDiversFromSupabase } from '../services/supabaseService';
import { TOTAL_ADULT_EUR, CHILD_HOTEL_SURCHARGE_EUR } from '../constants';
import { Language, Theme, ExchangeRates, Diver } from '../types';
import { useAuth } from '../contexts/AuthProvider';
import { AdminAccessRequestsPanel } from './AdminAccessRequestsPanel';
import { PaymentManager } from './PaymentManager';
import { UserManagementPanel } from './UserManagementPanel';
import {
    Download,
    RefreshCw,
    ShieldCheck,
    Mail,
    CalendarDays,
    LogOut,
    Loader2,
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Save,
    X,
    Key,
    RotateCcw,
    Copy,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import ReadinessDashboard from './admin/ReadinessDashboard';
import { fetchExchangeRates } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { hashPin } from '../utils/pinCrypto';
import { translations } from '../utils/translations';

interface Props {
    lang: Language;
    theme: Theme;
    onLogout?: () => void;
}

const Admin: React.FC<Props> = ({ lang, theme, onLogout }) => {
    const { user, isAdmin, logout } = useAuth();
    const t = translations[lang];
    const [tab, setTab] = useState<'finance' | 'manifest' | 'requests' | 'users' | 'logs' | 'readiness'>('requests');
    const [syncing, setSyncing] = useState(false);
    const [divers, setDivers] = useState<Diver[]>([]);
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [repairing, setRepairing] = useState(false);

    const handleRepairChecklists = async () => {
        if (!confirm('This will ensure all active/confirmed users have a checklist. Continue?')) return;

        setRepairing(true);
        try {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, name')
                .in('status', ['active', 'confirmed']);

            if (userError) throw userError;

            const template = [
                { id: 'doc_001', category: 'dokumenti', name: 'Pasoš', name_en: 'Passport', mandatory: true, priority: 'critical', icon: '🛂' },
                { id: 'doc_002', category: 'dokumenti', name: 'Putničko osiguranje', name_en: 'Travel Insurance', mandatory: true, priority: 'critical', icon: '🛡️' },
                { id: 'doc_003', category: 'dokumenti', name: 'Lična karta', name_en: 'ID Card', mandatory: false, priority: 'medium', icon: '🪪' },
                { id: 'doc_005', category: 'dokumenti', name: 'SSI certifikat', name_en: 'SSI Certification', mandatory: true, priority: 'critical', icon: '💳' },
                { id: 'doc_006', category: 'dokumenti', name: 'Potvrda o rezervaciji hotela', name_en: 'Hotel Booking Confirmation', mandatory: false, priority: 'medium', icon: '🏨' },
                { id: 'doc_007', category: 'dokumenti', name: 'Kontakt za hitne slučajeve', name_en: 'Emergency Contact', mandatory: false, priority: 'high', icon: '📞' },
                { id: 'mon_001', category: 'novac', name: 'Dolari (USD)', name_en: 'Dollars (USD)', mandatory: true, priority: 'critical', icon: '💵' },
                { id: 'mon_002', category: 'novac', name: 'Kreditna kartica', name_en: 'Credit Card', mandatory: false, priority: 'high', icon: '💳' },
                { id: 'mon_003', category: 'novac', name: 'Dolari sitno za napojnice', name_en: 'Small USD for tips', mandatory: false, priority: 'medium', icon: '💸' },
                { id: 'div_001', category: 'oprema', name: 'Neopren odijelo 3mm', name_en: 'Wetsuit 3mm', mandatory: true, priority: 'high', icon: '🏄' },
                { id: 'div_002', category: 'oprema', name: 'Maska', name_en: 'Mask', mandatory: true, priority: 'high', icon: '🤿' },
                { id: 'div_003', category: 'oprema', name: 'Disalica (snorkel)', name_en: 'Snorkel', mandatory: true, priority: 'high', icon: '🎋' },
                { id: 'div_004', category: 'oprema', name: 'Peraje', name_en: 'Fins', mandatory: true, priority: 'high', icon: '🧜' },
                { id: 'div_005', category: 'oprema', name: 'Ronilačke čizme', name_en: 'Dive Boots', mandatory: true, priority: 'high', icon: '👢' },
                { id: 'div_006', category: 'oprema', name: 'Diving kompjuter', name_en: 'Dive Computer', mandatory: true, priority: 'critical', icon: '⌚' },
                { id: 'div_007', category: 'oprema', name: 'BCD', name_en: 'BCD', mandatory: true, priority: 'high', icon: '🎒' },
                { id: 'div_008', category: 'oprema', name: 'Regulator', name_en: 'Regulator', mandatory: true, priority: 'high', icon: '🌬️' },
                { id: 'div_009', category: 'oprema', name: 'Octopus', name_en: 'Octopus', mandatory: false, priority: 'high', icon: '🐙' },
                { id: 'div_010', category: 'oprema', name: 'Nož', name_en: 'Dive Knife', mandatory: false, priority: 'medium', icon: '🔪' },
                { id: 'div_011', category: 'oprema', name: 'Podvodna kamera', name_en: 'Underwater Camera', mandatory: false, priority: 'medium', icon: '📷' },
                { id: 'div_012', category: 'oprema', name: 'Torba za opremu', name_en: 'Gear Bag', mandatory: false, priority: 'medium', icon: '👜' },
                { id: 'clo_001', category: 'odjeca', name: 'Kupaći kostimi', name_en: 'Swimwear', mandatory: false, priority: 'high', icon: '🩱' },
                { id: 'clo_002', category: 'odjeca', name: 'Šorc', name_en: 'Shorts', mandatory: false, priority: 'medium', icon: '🩳' },
                { id: 'clo_003', category: 'odjeca', name: 'Bermude', name_en: 'Bermuda', mandatory: false, priority: 'medium', icon: '🩳' },
                { id: 'clo_004', category: 'odjeca', name: 'Majice', name_en: 'T-shirts', mandatory: false, priority: 'medium', icon: '👕' },
                { id: 'clo_005', category: 'odjeca', name: 'Duks', name_en: 'Hoodie', mandatory: false, priority: 'medium', icon: '🧥' },
                { id: 'clo_006', category: 'odjeca', name: 'Jakna', name_en: 'Jacket', mandatory: false, priority: 'medium', icon: '🧥' },
                { id: 'clo_007', category: 'odjeca', name: 'Šešir', name_en: 'Hat', mandatory: false, priority: 'medium', icon: '👒' },
                { id: 'clo_008', category: 'odjeca', name: 'Sunčane naočale', name_en: 'Sunglasses', mandatory: false, priority: 'medium', icon: '🕶️' },
                { id: 'clo_009', category: 'odjeca', name: 'Patike', name_en: 'Sneakers', mandatory: false, priority: 'medium', icon: '👟' },
                { id: 'clo_010', category: 'odjeca', name: 'Čarape', name_en: 'Socks', mandatory: false, priority: 'low', icon: '🧦' },
                { id: 'clo_011', category: 'odjeca', name: 'Donje rublje', name_en: 'Underwear', mandatory: false, priority: 'medium', icon: '🩲' },
                { id: 'clo_012', category: 'odjeca', name: 'Pidžama', name_en: 'Pajamas', mandatory: false, priority: 'low', icon: '👕' },
                { id: 'hea_001', category: 'zdravlje', name: 'UV krema SPF 50+', name_en: 'Sunscreen 50+', mandatory: true, priority: 'high', icon: '🧴' },
                { id: 'hea_002', category: 'zdravlje', name: 'After sun njega', name_en: 'After sun care', mandatory: false, priority: 'medium', icon: '🧴' },
                { id: 'hea_003', category: 'zdravlje', name: 'Sprej protiv komaraca', name_en: 'Mosquito spray', mandatory: false, priority: 'medium', icon: '🦟' },
                { id: 'hea_004', category: 'zdravlje', name: 'Paracetamol', name_en: 'Paracetamol', mandatory: true, priority: 'high', icon: '💊' },
                { id: 'hea_005', category: 'zdravlje', name: 'Ibuprofen', name_en: 'Ibuprofen', mandatory: true, priority: 'high', icon: '💊' },
                { id: 'hea_006', category: 'zdravlje', name: 'Probiotici', name_en: 'Probiotics', mandatory: false, priority: 'medium', icon: '💊' },
                { id: 'hea_007', category: 'zdravlje', name: 'Tablete protiv mučnine', name_en: 'Motion sickness pills', mandatory: false, priority: 'medium', icon: '💊' },
                { id: 'hea_008', category: 'zdravlje', name: 'Flasteri', name_en: 'Plasters', mandatory: false, priority: 'low', icon: '🩹' },
                { id: 'hea_009', category: 'zdravlje', name: 'Gaze', name_en: 'Gauze', mandatory: false, priority: 'low', icon: '🩹' },
                { id: 'hea_010', category: 'zdravlje', name: 'Dezinfekcija', name_en: 'Disinfectant', mandatory: false, priority: 'medium', icon: '🧼' },
                { id: 'hea_011', category: 'zdravlje', name: 'Kapi za uši', name_en: 'Ear drops', mandatory: true, priority: 'high', icon: '💧' },
                { id: 'hea_012', category: 'zdravlje', name: 'Pribor za higijenu', name_en: 'Toiletries', mandatory: false, priority: 'medium', icon: '🪥' },
                { id: 'ele_001', category: 'elektronika', name: 'Podvodno kućište', name_en: 'Underwater Housing', mandatory: false, priority: 'high', icon: '📦' },
                { id: 'ele_002', category: 'elektronika', name: 'Dodatne baterije', name_en: 'Extra batteries', mandatory: false, priority: 'medium', icon: '🔋' },
                { id: 'ele_003', category: 'elektronika', name: 'Punjač za kameru', name_en: 'Camera charger', mandatory: false, priority: 'medium', icon: '🔌' },
                { id: 'ele_004', category: 'elektronika', name: 'Memorijske kartice', name_en: 'Memory cards', mandatory: false, priority: 'medium', icon: '💾' },
                { id: 'ele_005', category: 'elektronika', name: 'Punjač za mobitel', name_en: 'Phone charger', mandatory: false, priority: 'high', icon: '🔌' },
                { id: 'ele_006', category: 'elektronika', name: 'Power bank', name_en: 'Power bank', mandatory: false, priority: 'high', icon: '🔋' },
                { id: 'ele_007', category: 'elektronika', name: 'Putnički adapter za struju (D)', name_en: 'Travel adapter (D)', mandatory: false, priority: 'high', icon: '🔌' }
            ];

            for (const u of users) {
                const items = template.map((item, idx) => ({
                    ...item,
                    user_id: u.id,
                    sort_order: idx
                }));

                await supabase.from('checklist_items').upsert(items, { onConflict: 'id,user_id' });
            }

            alert(`Successfully repaired checklists for ${users.length} users!`);
            window.location.reload();
        } catch (err: any) {
            console.error('Repair failed:', err);
            alert('Failed to repair: ' + err.message);
        } finally {
            setRepairing(false);
        }
    };
    const [newsletterLogs, setNewsletterLogs] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingDiver, setEditingDiver] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDiver, setNewDiver] = useState<Partial<Diver>>({
        name: '',
        email: '',
        isPro: false,
        isDiver: true,
        status: 'pending',
        role: 'Adult'
    });
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [showingPin, setShowingPin] = useState<{ [key: string]: string }>({});
    const [pinGenerating, setPinGenerating] = useState<string | null>(null);

    useEffect(() => {
        if (!isAdmin || !user) {
            console.warn('Admin access denied or user not authenticated');
            return;
        }

        const loadAdminData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .order('name');

                if (userError) {
                    console.warn('Users query error:', userError);
                    const cached = localStorage.getItem('kvs_divers_cache');
                    if (cached) setDivers(JSON.parse(cached));
                } else {
                    const formattedDivers = (userData || []).map(d => {
                        const result = {
                            id: d.id,
                            name: d.name,
                            email: d.email,
                            role: d.role === 'admin' ? 'Admin' : 'Member',
                            status: d.status || 'pending',
                            photo: d.photo_url || '',
                            is_pro: d.is_pro || d.role === 'admin',
                            isPro: d.is_pro || d.role === 'admin',
                            access_status: d.status
                        };

                        return result;
                    });

                    setDivers(formattedDivers);
                    localStorage.setItem('kvs_divers_cache', JSON.stringify(formattedDivers));
                }

                const { data: requestData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                setPendingRequests(requestData || []);

                const { data: paymentsData, error: paymentsError } = await supabase
                    .from('payments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!paymentsError) {
                    setPayments(paymentsData || []);
                }

                const rates = await fetchExchangeRates();
                setRates(rates);

                setNewsletterLogs(JSON.parse(localStorage.getItem('kvs_newsletter_logs') || '[]'));
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Error loading admin data';
                console.error(errorMsg, err);
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, [isAdmin, user]);

    const generateRandomPin = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleGeneratePin = useCallback(async (diverId: string, diverName: string) => {
        setPinGenerating(diverId);
        try {
            const { data: userCheck, error: userCheckError } = await supabase
                .from('users')
                .select('id, name, email, status, pin_code')
                .eq('id', diverId)
                .single();

            if (userCheckError) {
                throw new Error(`User does not exist: ${userCheckError.message}`);
            }

            let newPin;
            let uniqueAttempts = 0;

            do {
                newPin = generateRandomPin();
                const { data: existing, error: checkError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('pin_code', newPin)
                    .limit(1);

                if (checkError) throw checkError;

                if (!existing || existing.length === 0) break;

                uniqueAttempts++;
                if (uniqueAttempts > 20) throw new Error('Cannot generate unique PIN after 20 attempts');
            } while (true);

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    pin_code: newPin,
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', diverId);

            if (updateError) throw updateError;

            const { data: verifyData, error: verifyError } = await supabase
                .from('users')
                .select('id, pin_code, status, name, email')
                .eq('id', diverId)
                .single();

            if (verifyError) throw new Error(`Verification failed: ${verifyError.message}`);

            if (verifyData.pin_code === newPin) {
                setShowingPin(prev => ({ ...prev, [diverId]: newPin }));
                setError(null);

                setTimeout(() => {
                    setShowingPin(prev => {
                        const newState = { ...prev };
                        delete newState[diverId];
                        return newState;
                    });
                }, 30000);
            } else {
                throw new Error(`PIN not saved correctly. Expected ${newPin}, got ${verifyData.pin_code}`);
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to generate PIN';
            setError(errorMsg);
        } finally {
            setPinGenerating(null);
        }
    }, []);

    const handleExportPins = useCallback(() => {
        setTimeout(() => {
            const confirmedDivers = divers.filter(d => d.status === 'confirmed');

            if (confirmedDivers.length === 0) {
                setError('No confirmed divers to export.');
                return;
            }

            const csvHeaders = ['Name', 'Email', 'Phone', 'Status'];
            const csvRows = confirmedDivers.map(d => [
                d.name,
                d.email,
                d.phone1 || '',
                d.status
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `KVS-Divers-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 0);
    }, [divers]);

    const handleAddDiver = useCallback(async () => {
        if (!newDiver.name?.trim() || !newDiver.email?.trim()) {
            setError('Name and email are required');
            return;
        }

        try {
            const payload = {
                name: newDiver.name,
                email: newDiver.email,
                status: 'active',
                role: ['mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com'].includes(newDiver.email?.toLowerCase() || '') ? 'admin' : 'member',
                is_pro: newDiver.isPro,
                is_diver: newDiver.isDiver,
                total_dives: newDiver.isDiver ? (newDiver as any).dives : 0,
                start_year: newDiver.isDiver ? (newDiver as any).startYear : null,
                master_id: newDiver.isDiver ? (newDiver as any).masterId : null,
                ssi_pro_id: newDiver.isDiver ? (newDiver as any).ssiProId : null,
                updated_at: new Date().toISOString()
            };

            const { data, error: err } = await supabase
                .from('users')
                .insert([payload])
                .select();

            if (err) throw err;

            setDivers([...divers, {
                ...data[0],
                isPro: data[0].is_pro,
                isDiver: data[0].is_diver,
                dives: data[0].total_dives,
                startYear: data[0].start_year,
                masterId: data[0].master_id,
                ssiProId: data[0].ssi_pro_id
            } as Diver]);

            setNewDiver({ name: '', email: '', isPro: false, isDiver: true, status: 'pending', role: 'Adult' });
            setShowAddForm(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add participant');
        }
    }, [divers, newDiver]);

    const handleUpdateDiver = useCallback(async (diverToUpdate: any) => {
        try {
            const isPro = diverToUpdate.is_pro || diverToUpdate.isPro || false;

            const payload = {
                name: diverToUpdate.name,
                email: diverToUpdate.email,
                status: diverToUpdate.status,
                role: (diverToUpdate.role || 'member').toLowerCase(),
                is_pro: isPro,
                is_diver: diverToUpdate.isDiver,
                total_dives: diverToUpdate.isDiver ? diverToUpdate.dives : 0,
                start_year: diverToUpdate.isDiver ? diverToUpdate.startYear : null,
                master_id: diverToUpdate.isDiver ? diverToUpdate.masterId : null,
                ssi_pro_id: diverToUpdate.isDiver ? diverToUpdate.ssiProId : null,
                phone: diverToUpdate.phone1,
                address: diverToUpdate.address,
                city: diverToUpdate.city,
                country: diverToUpdate.country,
                birth_date: diverToUpdate.birthDate,
                age: diverToUpdate.age,
                dietary_restriction: diverToUpdate.dietaryRestrictions,
                emergency_contact_name: diverToUpdate.emergencyContact?.name,
                emergency_contact_relationship: diverToUpdate.emergencyContact?.relationship,
                emergency_contact_phone: diverToUpdate.emergencyContact?.phone,
                updated_at: new Date().toISOString()
            };

            const { error: err } = await supabase
                .from('users')
                .update(payload)
                .eq('id', diverToUpdate.id);

            if (err) throw err;

            const { data: updatedData, error: reloadError } = await supabase
                .from('users')
                .select('*')
                .order('name');

            if (!reloadError && updatedData) {
                const formattedDivers = (updatedData || []).map(d => ({
                    id: d.id,
                    name: d.name,
                    email: d.email,
                    role: d.role === 'admin' ? 'Admin' : 'Member',
                    status: d.status || 'pending',
                    photo: d.photo_url || '',
                    is_pro: d.is_pro || d.role === 'admin',
                    isPro: d.is_pro || d.role === 'admin',
                    access_status: d.status
                }));

                setDivers(formattedDivers);
                localStorage.setItem('kvs_divers_cache', JSON.stringify(formattedDivers));
            }

            setEditingDiver(null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update participant');
        }
    }, []);

    const handleDeleteDiver = useCallback(async (diverId: string) => {
        if (!confirm('Are you sure you want to delete this participant?')) return;

        try {
            const { error: err } = await supabase
                .from('users')
                .delete()
                .eq('id', diverId);

            if (err) throw err;

            setDivers(divers.filter(d => d.id !== diverId));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete participant');
        }
    }, [divers]);

    const handleAcceptRequest = useCallback(async (diver: any) => {
        try {
            const { error: err } = await supabase
                .from('users')
                .update({ status: 'active' })
                .eq('id', diver.id);

            if (err) throw err;

            setPendingRequests(pendingRequests.filter(r => r.id !== diver.id));
            setDivers([...divers, {
                ...diver,
                status: 'active',
                role: 'Member'
            }]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept request');
        }
    }, [divers, pendingRequests]);

    const handleRejectRequest = useCallback(async (diverId: string) => {
        try {
            const { error: err } = await supabase
                .from('users')
                .delete()
                .eq('id', diverId);

            if (err) throw err;

            setPendingRequests(pendingRequests.filter(r => r.id !== diverId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject request');
        }
    }, [pendingRequests]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
                <ShieldCheck className="w-20 h-20 text-red-500/20 mb-6" />
                <h2 className="text-3xl font-black text-[#001219]">PRISTUP OBIJEN</h2>
                <p className="text-gray-500 mt-2 max-w-md">Nemate administratorske privilegije potrebne za pregled ovog dijela aplikacije.</p>
                <button onClick={() => window.location.href = '/'} className="btn-primary mt-8 px-10 py-4">NAZAD NA POČETNU</button>
            </div>
        );
    }

    return (
        <div className={`w-full mx-auto px-6 space-y-10 pb-24 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219] text-white' : 'bg-white text-[#001219]'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10">
                <div className="flex items-center gap-4">
                    <div className="bg-[#005f73] p-4 rounded-[24px] shadow-xl shadow-[#005f73]/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{t.organizerHub}</h2>
                        <p className="text-xs font-black text-[#0a9396] uppercase tracking-[0.3em] mt-1">{t.expeditionManagement}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className={`p-3 rounded-full transition-all ${syncing ? 'animate-spin text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`}
                        title={t.syncData}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleExportPins}
                        className="btn-glass flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest"
                    >
                        <Download className="w-4 h-4" /> {t.exportData}
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        <LogOut className="w-4 h-4" /> {t.logout}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100/10">
                {[
                    { id: 'requests', label: t.requests, icon: Mail, count: pendingRequests.length },
                    { id: 'users', label: t.users, icon: ShieldCheck },
                    { id: 'finance', label: t.finance, icon: CalendarDays },
                    { id: 'readiness', label: 'READINESS', icon: ClipboardList },
                    { id: 'logs', label: t.logs, icon: LogOut }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id as any)}
                        className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-t-3xl transition-all relative ${tab === item.id
                            ? 'bg-[#005f73] text-white'
                            : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/5'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {item.count ? (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1 animate-pulse">
                                {item.count}
                            </span>
                        ) : null}
                        {tab === item.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400" />
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 animate-in slide-in-from-top-4">
                    <XCircle className="w-6 h-6" />
                    <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tab === 'requests' && (
                    <AdminAccessRequestsPanel
                        requests={pendingRequests}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                        theme={theme}
                        lang={lang}
                    />
                )}

                {tab === 'users' && (
                    <UserManagementPanel
                        divers={divers}
                        onEdit={setEditingDiver}
                        onDelete={handleDeleteDiver}
                        onAdd={() => setShowAddForm(true)}
                        onGeneratePin={handleGeneratePin}
                        showingPin={showingPin}
                        pinGenerating={pinGenerating}
                        theme={theme}
                        lang={lang}
                    />
                )}

                {tab === 'finance' && (
                    <PaymentManager
                        divers={divers}
                        payments={payments}
                        theme={theme}
                        lang={lang}
                    />
                )}

                {tab === 'readiness' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-[#005f73] p-6 rounded-[32px] text-white">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Expedition Readiness Hub</h3>
                                <p className="text-xs text-white/60 font-medium uppercase tracking-widest mt-1">Real-time checklist monitoring</p>
                            </div>
                            <button
                                onClick={handleRepairChecklists}
                                disabled={repairing}
                                className="btn-glass px-6 py-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                            >
                                {repairing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                Repair Checklists
                            </button>
                        </div>
                        <ReadinessDashboard lang={lang} theme={theme} />
                    </div>
                )}

                {tab === 'logs' && (
                    <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-xl shadow-cyan-900/5'}`}>
                        <h3 className="text-xl font-black mb-6 uppercase tracking-[0.2em]">{t.logs}</h3>
                        <div className="space-y-4">
                            {newsletterLogs.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-10 italic">Nema zabilježenih aktivnosti u ovom periodu.</p>
                            ) : (
                                newsletterLogs.map((log: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-cyan-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">Email poslata</p>
                                                <p className="text-xs text-gray-400">Primalac: {log.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {editingDiver && (
                <EditForm
                    diver={editingDiver}
                    onSave={handleUpdateDiver}
                    onCancel={() => setEditingDiver(null)}
                    theme={theme}
                    lang={lang}
                />
            )}

            {showAddForm && (
                <AddForm
                    onSave={handleAddDiver}
                    onCancel={() => setShowAddForm(false)}
                    newDiver={newDiver}
                    setNewDiver={setNewDiver}
                    theme={theme}
                    lang={lang}
                />
            )}
        </div>
    );
};

// Simplified Sub-components for Form
const EditForm = ({ diver, onSave, onCancel, theme, lang }: any) => {
    const [formData, setFormData] = useState({ ...diver });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className={`w-full max-w-lg rounded-[40px] p-10 border shadow-2xl ${theme === 'dark' ? 'bg-[#001219] border-white/10' : 'bg-white border-cyan-100'}`}>
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Edit Participant</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Email</label>
                        <input
                            type="email"
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Status</label>
                            <select
                                className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="active">Active</option>
                                <option value="confirmed">Confirmed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Role</label>
                            <select
                                className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold"
                                value={formData.role.toLowerCase()}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button onClick={onCancel} className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AddForm = ({ onSave, onCancel, newDiver, setNewDiver, theme, lang }: any) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className={`w-full max-w-lg rounded-[40px] p-10 border shadow-2xl ${theme === 'dark' ? 'bg-[#001219] border-white/10' : 'bg-white border-cyan-100'}`}>
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Add Participant</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold"
                            value={newDiver.name}
                            onChange={(e) => setNewDiver({ ...newDiver, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. john@example.com"
                            className="w-full bg-black/5 border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold"
                            value={newDiver.email}
                            onChange={(e) => setNewDiver({ ...newDiver, email: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button onClick={onCancel} className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={onSave} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all">Create Account</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
