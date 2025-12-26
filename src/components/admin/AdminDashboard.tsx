import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import Dashboard from './tabs/Dashboard';
import UserManagement from './tabs/UserManagement';
import PaymentManagement from './tabs/PaymentManagement';
import ActivityLog from './tabs/ActivityLog';
import SettingsTab from './tabs/Settings';

type TabType = 'dashboard' | 'users' | 'payments' | 'activity' | 'settings';

interface DashboardStats {
  totalUsers: number;
  pendingRequests: number;
  totalPayments: number;
  lastActivity: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get admin user name from localStorage or session
  const adminName = localStorage.getItem('adminName') || 'Administrator';

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      icon: Activity,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ] as const;

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminName');
    window.location.href = '/admin/login';
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'activity':
        return <ActivityLog />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-full' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            KVS-SCUBA
          </h1>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen && !isMobile ? 'ml-64' : ''} transition-margin duration-300`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
              Admin Panel
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {adminName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8">
          <div className="animate-fadeIn">
            {renderActiveComponent()}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 300ms ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
