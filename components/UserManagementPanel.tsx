import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { Edit2, RotateCcw, Trash2, Lock, Unlock, Loader2, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'revoked';
  pin_code?: string;
  created_at: string;
}

interface Props {
  lang?: Language;
}

export const UserManagementPanel: React.FC<Props> = ({ lang = 'BS' }) => {
  const { isAdmin, user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [regeneratingPin, setRegeneratingPin] = useState<string | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, name, email, role, status, pin_code, created_at')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setUsers((data as unknown as User[]) || []);
    } catch (err) {
      console.error('[UserManagementPanel] Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (statusFilter === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.status === statusFilter));
    }
  };

  const handleRegeneratePin = async (userId: string, userName: string) => {
    if (!confirm(t.confirmRegenerate)) return;

    setRegeneratingPin(userId);
    setError(null);
    setSuccess(null);

    try {
      // Generate new PIN
      const newPin = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          pin_code: newPin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, pin_code: newPin } : u
      ));

      // Copy to clipboard
      await navigator.clipboard.writeText(newPin);

      setSuccess(`📌 ${t.pinCopied}: ${newPin}`);
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      console.error('[UserManagementPanel] Error regenerating PIN:', err);
      setError('Failed to regenerate PIN');
    } finally {
      setRegeneratingPin(null);
    }
  };

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (!confirm(t.confirmDeactivate)) return;

    setDeactivatingUser(userId);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, status: 'revoked' as any } : u
      ));

      setSuccess(t.userDeactivated);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('[UserManagementPanel] Error deactivating user:', err);
      setError('Failed to deactivate user');
    } finally {
      setDeactivatingUser(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'active':
        return <span className={`${baseClass} bg-green-100 text-green-700`}>✓ {t.active}</span>;
      case 'approved':
        return <span className={`${baseClass} bg-blue-100 text-blue-700`}>✓ {t.approved}</span>;
      case 'pending':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>⏳ {t.pending}</span>;
      case 'rejected':
        return <span className={`${baseClass} bg-red-100 text-red-700`}>✕ {t.rejected}</span>;
      case 'revoked':
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>⛔ {t.revoked}</span>;
      default:
        return <span className={baseClass}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {t.all} ({users.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'pending'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {t.pending} ({users.filter(u => u.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'active'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {t.active} ({users.filter(u => u.status === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${statusFilter === 'rejected'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {t.rejected} ({users.filter(u => u.status === 'rejected').length})
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.colName}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.colEmail}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.colRole}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.colStatus}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.colPin}</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                    {user.role === 'admin' ? `👑 ${t.admin}` : `👤 ${t.member}`}
                  </span>
                </td>
                <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                <td className="px-4 py-3">
                  {user.pin_code ? (
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">
                      {user.pin_code}
                    </code>
                  ) : (
                    <span className="text-gray-400 text-xs">NO PIN</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {user.status !== 'pending' && user.status !== 'revoked' && (
                      <button
                        onClick={() => handleRegeneratePin(user.id, user.name)}
                        disabled={regeneratingPin === user.id}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded disabled:opacity-50"
                        title={t.regeneratePin}
                      >
                        {regeneratingPin === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {user.status !== 'revoked' && !user.role?.includes('admin') && (
                      <button
                        onClick={() => handleDeactivateUser(user.id, user.name)}
                        disabled={deactivatingUser === user.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                        title={t.deactivateUser}
                      >
                        {deactivatingUser === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t.noUsersFound}</p>
        </div>
      )}
    </div>
  );
};
