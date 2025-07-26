import React, { useState } from 'react';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  Trash, 
  Download,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types';
import { storage } from '../utils/storage';

interface SettingsProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ language, onLanguageChange }) => {
  const [user, setUser] = useState(storage.getUser());
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateProfile = (field: string, value: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);
      storage.setUser(updatedUser);
    }
  };

  const exportData = () => {
    const data = {
      user: storage.getUser(),
      journal: storage.getJournalEntries(),
      sessions: storage.getSessions(),
      reviews: storage.getReviews()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindcare_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = () => {
    localStorage.clear();
    setShowDeleteConfirm(false);
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <User className="w-7 h-7 mr-3 text-blue-600" />
          Settings & Preferences
        </h2>
        <p className="text-gray-600">Customize your MindCare experience</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-500" />
          Profile Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={user?.name || ''}
              onChange={(e) => updateProfile('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              onChange={(e) => updateProfile('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Language & Localization */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-green-500" />
          Language & Region
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            All app content, including chatbot responses, will be in your selected language
          </p>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-purple-500" />
          App Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Push Notifications</div>
              <div className="text-sm text-gray-600">Receive reminders and updates</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Dark Mode</div>
              <div className="text-sm text-gray-600">Switch to dark theme</div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform flex items-center justify-center ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {darkMode ? <Moon className="w-3 h-3 text-gray-700" /> : <Sun className="w-3 h-3 text-yellow-500" />}
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Sound Effects</div>
              <div className="text-sm text-gray-600">Play sounds for interactions</div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform flex items-center justify-center ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 text-green-600" /> : <VolumeX className="w-3 h-3 text-gray-500" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-indigo-500" />
          Privacy & Data
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Data Export</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download all your personal data including journal entries, sessions, and preferences
            </p>
            <button
              onClick={exportData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export My Data</span>
            </button>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Delete All Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete all your data from this device. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash className="w-4 h-4" />
              <span>Delete All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <Trash className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete All Data?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all your journal entries, sessions, preferences, and other data. 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={deleteAllData}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">MindCare v1.0</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your personal mental wellness companion
          </p>
          <div className="text-xs text-gray-500">
            <p>MindCare is a wellness support tool and does not provide clinical diagnosis.</p>
            <p className="mt-1">Always consult with healthcare professionals for serious concerns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;