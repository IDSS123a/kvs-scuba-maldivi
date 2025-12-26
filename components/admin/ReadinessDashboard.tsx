
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    ShieldCheck,
    FileText,
    Trash2,
    MoreVertical,
    ExternalLink,
    RotateCw
} from 'lucide-react';

interface ReadinessStatus {
    total_mandatory: number;
    checked_mandatory: number;
    is_ready: boolean;
}

interface UserReadiness {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    readiness?: ReadinessStatus;
}

interface ReadinessDashboardProps {
    lang?: 'BS' | 'EN';
    theme?: 'light' | 'dark';
}

const ReadinessDashboard: React.FC<ReadinessDashboardProps> = ({ lang = 'BS', theme = 'light' }) => {
    const [users, setUsers] = useState<UserReadiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterReady, setFilterReady] = useState<'all' | 'ready' | 'not_ready'>('all');
    const [selectedUser, setSelectedUser] = useState<UserReadiness | null>(null);
    const [userChecklist, setUserChecklist] = useState<any[]>([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);

    useEffect(() => {
        loadReadinessData();
    }, []);

    const loadReadinessData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Get all active & confirmed users
            const { data: usersData, error: userError } = await supabase
                .from('users')
                .select('id, name, email, role, status')
                .in('status', ['active', 'confirmed'])
                .order('name');

            if (userError) throw userError;

            // 2. For each user, calculate readiness using the RPC function
            const readinessResults = await Promise.all(
                usersData.map(async (user) => {
                    const { data, error: rpcError } = await supabase
                        .rpc('calculate_readiness_status', { user_uuid: user.id });

                    if (rpcError) {
                        console.error(`Error calculating readiness for ${user.name}:`, rpcError);
                        return { ...user, readiness: { total_mandatory: 0, checked_mandatory: 0, is_ready: false } };
                    }
                    return { ...user, readiness: data[0] };
                })
            );

            setUsers(readinessResults);
        } catch (err: any) {
            console.error('Error loading readiness dashboard:', err);
            setError(err.message || 'Failed to load readiness data');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user: UserReadiness) => {
        setSelectedUser(user);
        setLoadingChecklist(true);
        try {
            const { data, error } = await supabase
                .from('checklist_items')
                .select('*')
                .eq('user_id', user.id)
                .order('category')
                .order('sort_order');

            if (error) throw error;
            setUserChecklist(data || []);
        } catch (err) {
            console.error('Error loading user checklist:', err);
        } finally {
            setLoadingChecklist(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterReady === 'ready') return matchesSearch && user.readiness?.is_ready;
        if (filterReady === 'not_ready') return matchesSearch && !user.readiness?.is_ready;
        return matchesSearch;
    });

    const getPercentage = (readiness?: ReadinessStatus) => {
        if (!readiness || readiness.total_mandatory === 0) return 0;
        return Math.round((readiness.checked_mandatory / readiness.total_mandatory) * 100);
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'text-emerald-500 bg-emerald-500/10';
        if (percent >= 70) return 'text-cyan-500 bg-cyan-500/10';
        if (percent >= 30) return 'text-amber-500 bg-amber-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-sm font-black animate-pulse text-cyan-600">LOADING READINESS DATA...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>Expedition Readiness Dashboard</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Admin Monitoring Overview</p>
                </div>
                <button
                    onClick={loadReadinessData}
                    className={`p-4 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                    <RotateCw className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-sm'}`}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Participants</p>
                    <p className="text-4xl font-black tracking-tighter text-cyan-600">{users.length}</p>
                </div>
                <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-sm'}`}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Ready for Travel</p>
                    <p className="text-4xl font-black tracking-tighter text-emerald-500">{users.filter(u => u.readiness?.is_ready).length}</p>
                </div>
                <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-sm'}`}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Needs Preparation</p>
                    <p className="text-4xl font-black tracking-tighter text-amber-500">{users.filter(u => !u.readiness?.is_ready).length}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className={`flex-1 flex items-center gap-3 px-6 py-4 rounded-3xl border ${theme === 'dark' ? 'bg-[#001a24] border-white/10' : 'bg-white border-cyan-50 shadow-sm'}`}>
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search participants..."
                        className="bg-transparent border-none outline-none w-full text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'ready', 'not_ready'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterReady(f as any)}
                            className={`px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${filterReady === f
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : (theme === 'dark' ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-500 shadow-sm')
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* User List */}
                <div className="space-y-4">
                    {filteredUsers.map(user => {
                        const percent = getPercentage(user.readiness);
                        const isSelected = selectedUser?.id === user.id;

                        return (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user)}
                                className={`p-6 rounded-[32px] border cursor-pointer transition-all duration-300 flex items-center justify-between ${isSelected
                                    ? 'border-cyan-500 bg-cyan-500/5'
                                    : (theme === 'dark' ? 'bg-[#001a24] border-white/5 hover:border-white/10' : 'bg-white border-cyan-50 hover:shadow-lg')
                                    }`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${getProgressColor(percent)}`}>
                                        {percent}%
                                    </div>
                                    <div>
                                        <h4 className="font-black tracking-tight">{user.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Mandatory</p>
                                        <p className="font-bold text-sm">
                                            {user.readiness?.checked_mandatory} / {user.readiness?.total_mandatory}
                                        </p>
                                    </div>
                                    {user.readiness?.is_ready ? (
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-amber-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detail View */}
                <div className="relative">
                    {selectedUser ? (
                        <div className={`sticky top-8 p-10 rounded-[48px] border overflow-hidden transition-all duration-500 ${theme === 'dark' ? 'bg-[#000d11] border-white/10' : 'bg-white border-cyan-100 shadow-2xl'
                            }`}>
                            {/* Background gradient */}
                            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors ${selectedUser.readiness?.is_ready ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                                }`} />

                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${selectedUser.readiness?.is_ready ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                            }`}>
                                            {selectedUser.readiness?.is_ready ? 'READY FOR TRAVEL' : 'MISSING ITEMS'}
                                        </span>
                                        <h3 className="text-3xl font-black tracking-tight mt-4">{selectedUser.name}</h3>
                                        <p className="text-sm font-medium text-gray-400">{selectedUser.email}</p>
                                    </div>
                                    <Users className="w-10 h-10 text-cyan-500 opacity-20" />
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingChecklist ? (
                                        <div className="flex py-10 justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>
                                    ) : (
                                        userChecklist.map(item => (
                                            <div key={item.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    {item.checked ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className={`w-5 h-5 ${item.mandatory ? 'text-red-500' : 'text-gray-400'}`} />
                                                    )}
                                                    <div>
                                                        <p className={`text-sm font-bold ${item.checked ? 'text-emerald-500/70' : (item.mandatory ? 'text-red-400' : 'text-gray-400')}`}>
                                                            {lang === 'BS' ? item.name : item.name_en}
                                                        </p>
                                                        {item.mandatory && !item.checked && (
                                                            <p className="text-[8px] font-black text-red-500 uppercase">Required for Ready status</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.checked && item.checked_at && (
                                                    <span className="text-[9px] text-gray-500 font-medium">
                                                        {new Date(item.checked_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Close Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`h-full min-h-[400px] rounded-[48px] border border-dashed flex flex-col items-center justify-center p-12 text-center transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-cyan-100 bg-cyan-50/30'
                            }`}>
                            <ShieldCheck className="w-20 h-20 text-cyan-500/20 mb-6" />
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Select Participant</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-xs">Click on any participant to see their detailed readiness status and missing items.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReadinessDashboard;
