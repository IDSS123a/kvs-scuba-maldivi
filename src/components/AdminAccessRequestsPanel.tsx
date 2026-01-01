
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, XCircle, Copy, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { approveUserWithPin, rejectUserAccessRequest } from '../services/pinService';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface AccessRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    created_at: string;
}

interface Props {
    lang?: Language;
}

export const AdminAccessRequestsPanel: React.FC<Props> = ({ lang = 'BS' }) => {
    const { user: currentAdmin } = useAuth();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingPin, setGeneratingPin] = useState<string | null>(null);
    const [showingPin, setShowingPin] = useState<{ [key: string]: string }>({});
    const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

    const t = translations[lang];

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const { data, error: queryError } = await supabase
                .from('users')
                .select('id, name, email, phone, status, created_at')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (queryError) throw queryError;
            setRequests(data || []);
            setError('');
        } catch (err) {
            console.error('❌ Error fetching requests:', err);
            setError('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: AccessRequest) => {
        if (!(currentAdmin as any)?.uid) {
            setError('Admin user ID not available');
            return;
        }

        setGeneratingPin(request.id);

        try {
            const result = await approveUserWithPin(request.id, (currentAdmin as any).uid);

            if (!result.success) {
                setError(`Failed to approve ${request.name}: ${result.error || 'Unknown error'}`);
                setGeneratingPin(null);
                return;
            }

            const newPin = result.pin!;
            setShowingPin({ ...showingPin, [request.id]: newPin });

            const message = `
✅ ${t.approved}: ${request.name}
PIN: ${newPin}
${t.pinCopied}
      `.trim();

            alert(message);

            try {
                await navigator.clipboard.writeText(newPin);
            } catch (clipError) {
                console.warn('Could not copy to clipboard:', clipError);
            }

            setRequests(requests.filter(r => r.id !== request.id));
            setError('');

            setTimeout(() => {
                setShowingPin(prev => {
                    const newState = { ...prev };
                    delete newState[request.id];
                    return newState;
                });
            }, 30000);

        } catch (err) {
            setError(`Failed to approve ${request.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setGeneratingPin(null);
        }
    };

    const handleReject = async (request: AccessRequest) => {
        if (!(currentAdmin as any)?.uid) {
            setError('Admin user ID not available');
            return;
        }

        const reason = rejectReason[request.id] || 'Nije ispunio uslove';

        if (!confirm(`${t.rejected} ${request.name}?`)) return;

        try {
            const result = await rejectUserAccessRequest(request.id, (currentAdmin as any).uid, reason);

            if (result.success) {
                setRequests(requests.filter(r => r.id !== request.id));
                setRejectReason(prev => {
                    const newState = { ...prev };
                    delete newState[request.id];
                    return newState;
                });
            } else {
                setError(result.error || 'Failed to reject user');
            }
        } catch (err) {
            setError('Exception while rejecting user');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider border-b border-gray-200 pb-2">
                {t.requests} ({requests.length})
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="block sm:inline text-sm font-bold">{error}</span>
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Nema novih zahtjeva</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{req.name}</h4>
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">
                                        {t.pending}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-0.5">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <span className="font-mono text-xs opacity-50">EMAIL</span> {req.email}
                                    </p>
                                    {req.phone && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                            <span className="font-mono text-xs opacity-50">PHONE</span> {req.phone}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 pt-1">
                                        {new Date(req.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[200px]">
                                <button
                                    onClick={() => handleApprove(req)}
                                    disabled={generatingPin === req.id}
                                    className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {generatingPin === req.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> {t.generating}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> {t.approved} (PIN)
                                        </>
                                    )}
                                </button>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Razlog odbijanja..."
                                        className="flex-1 text-xs border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white rounded px-2 outline-none focus:border-cyan-500 transition-colors"
                                        value={rejectReason[req.id] || ''}
                                        onChange={(e) => setRejectReason({ ...rejectReason, [req.id]: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleReject(req)}
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-xs transition-colors"
                                    >
                                        {t.rejected}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
