import React, { useState, useEffect } from 'react';
import { Activity, Filter, Search, Download, Calendar } from 'lucide-react';
import { supabase } from '../../../services/authService';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'user' | 'payment' | 'admin' | 'system';
  ipAddress: string;
  status: 'success' | 'failure';
}

const ActivityLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'user' | 'payment' | 'admin' | 'system'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure'>('all');
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  // Load activity logs from Supabase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select(`
            *,
            users:user_id (email)
          `)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) {
          // If table doesn't exist yet, silently fail or mock
          console.warn('Activity log fetch error (table might be missing):', error.message);
          return;
        }

        if (data) {
          const mappedLogs: ActivityLogEntry[] = data.map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            user: log.users?.email || 'Unknown',
            action: log.activity_type.replace(/_/g, ' '),
            category: (log.category as any) || 'system',
            ipAddress: log.ip_address || '-',
            status: 'success', // Defaulting to success as failures usually throw before log? Or based on type
          }));
          setLogs(mappedLogs);
        }
      } catch (err) {
        console.error('Error loading activity logs:', err);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      (filterCategory === 'all' || log.category === filterCategory) &&
      (filterStatus === 'all' || log.status === filterStatus) &&
      (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryColor = (category: ActivityLogEntry['category']) => {
    switch (category) {
      case 'user':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'payment':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'system':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: ActivityLogEntry['status']) => {
    return status === 'success'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor all system activities and user actions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by user, action, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="user">User</option>
          <option value="payment">Payment</option>
          <option value="admin">Admin</option>
          <option value="system">System</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  User
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  Action
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  Category
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(log.category)}`}>
                      {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                      {log.status === 'success' ? '✓' : '✗'} {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No activity logs found matching your criteria
            </p>
          </div>
        )}

        {filteredLogs.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredLogs.length} of {logs.length} entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
