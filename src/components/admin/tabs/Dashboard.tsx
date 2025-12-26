import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Bell,
  CheckCircle,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  totalPayments: number;
  lastActivity: string;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'payment' | 'request' | 'system';
  message: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingRequests: 0,
    totalPayments: 0,
    lastActivity: 'Never',
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stats from database/API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        
        // Mock data for now
        setStats({
          totalUsers: 1_234,
          pendingRequests: 12,
          totalPayments: 50_000,
          lastActivity: new Date().toLocaleTimeString(),
        });

        setActivities([
          {
            id: '1',
            type: 'user',
            message: 'New user registered: John Doe',
            timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '2',
            type: 'payment',
            message: 'Payment received: $500.00 from Jane Smith',
            timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '3',
            type: 'request',
            message: 'Dive certification request pending approval',
            timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
            status: 'pending',
          },
          {
            id: '4',
            type: 'user',
            message: 'User profile updated: Alice Johnson',
            timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '5',
            type: 'system',
            message: 'Database backup completed successfully',
            timestamp: new Date(Date.now() - 60 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '6',
            type: 'payment',
            message: 'Payment failed: Insufficient funds',
            timestamp: new Date(Date.now() - 90 * 60000).toLocaleTimeString(),
            status: 'error',
          },
          {
            id: '7',
            type: 'user',
            message: 'User account suspended: Bob Wilson',
            timestamp: new Date(Date.now() - 120 * 60000).toLocaleTimeString(),
            status: 'error',
          },
          {
            id: '8',
            type: 'request',
            message: 'Certification approved for Mark Davis',
            timestamp: new Date(Date.now() - 150 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '9',
            type: 'user',
            message: 'New user registered: Sarah Connor',
            timestamp: new Date(Date.now() - 180 * 60000).toLocaleTimeString(),
            status: 'success',
          },
          {
            id: '10',
            type: 'payment',
            message: 'Refund issued: $250.00 to Michael Scott',
            timestamp: new Date(Date.now() - 210 * 60000).toLocaleTimeString(),
            status: 'success',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load stats:', error);
        setLoading(false);
      }
    };

    loadStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleApproveAll = () => {
    alert(`Approving all ${stats.pendingRequests} pending requests...`);
    // API call would go here
  };

  const handleSendReminders = () => {
    alert('Sending reminders to users with pending requests...');
    // API call would go here
  };

  const handleExportData = () => {
    alert('Exporting admin dashboard data...');
    // Export logic would go here
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user':
        return <Users size={16} />;
      case 'payment':
        return <DollarSign size={16} />;
      case 'request':
        return <Clock size={16} />;
      case 'system':
        return <Activity size={16} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBgColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your admin overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-medium">+12.5%</span>
            <span className="text-gray-600 dark:text-gray-400">from last month</span>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Pending Requests
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.pendingRequests}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <TrendingUp size={16} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              Awaiting Action
            </span>
          </div>
        </div>

        {/* Total Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${(stats.totalPayments / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-medium">+8.2%</span>
            <span className="text-gray-600 dark:text-gray-400">from last month</span>
          </div>
        </div>

        {/* Last Activity Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Last Activity
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                {stats.lastActivity}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Activity className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-600 dark:text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleApproveAll}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            <CheckCircle size={18} />
            Approve All Pending
          </button>
          <button
            onClick={handleSendReminders}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Bell size={18} />
            Send Reminders
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading activities...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getStatusBgColor(activity.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${getStatusBgColor(activity.status)}`}>
                    <div className={getStatusColor(activity.status)}>
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                  {activity.status && (
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(activity.status)} ${getStatusBgColor(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activities.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View All Activities →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
