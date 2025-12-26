import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Lock,
  Database,
  Save,
  AlertCircle,
} from 'lucide-react';

interface SettingsConfig {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  sessionTimeout: number;
  apiKey: string;
}

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SettingsConfig>({
    theme: 'auto',
    emailNotifications: true,
    twoFactorAuth: false,
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    apiKey: 'sk_live_****************************',
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof SettingsConfig) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleChange = (key: keyof SettingsConfig, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Save settings to database/API
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage admin panel settings and preferences.
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
            ✓
          </div>
          <p className="text-green-800 dark:text-green-300 font-medium">
            Settings saved successfully!
          </p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sun size={20} />
              Theme Settings
            </h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                Theme Preference
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={settings.theme === 'light'}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="w-4 h-4"
                  />
                  <Sun size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.theme === 'dark'}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="w-4 h-4"
                  />
                  <Moon size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Dark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={settings.theme === 'auto'}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Auto</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={20} />
              Notification Settings
            </h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Receive email alerts for important admin events
                </p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications
                    ? 'bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock size={20} />
              Security Settings
            </h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Add an extra layer of security to your admin account
                </p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleChange('sessionTimeout', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Automatically log out after this period of inactivity
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                API key for external integrations
              </p>
              <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Regenerate Key
              </button>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Database size={20} />
              Backup Settings
            </h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Automatic Backups
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Automatically backup the database
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) =>
                    handleChange(
                      'backupFrequency',
                      e.target.value as SettingsConfig['backupFrequency']
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium">
              Create Manual Backup Now
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm">
                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Save size={20} />
          Save Settings
        </button>
        <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
