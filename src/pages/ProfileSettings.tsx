import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Save, X, AlertCircle, CheckCircle2, Upload, Eye, EyeOff, Shield, Bell, Globe, Palette, Moon, Sun } from 'lucide-react';
import InputField from '../components/InputField';
import LazyImage from '../components/LazyImage';

interface ProfileFormData {
  displayName: string;
  email: string;
  bio: string;
  walletAddress: string;
  avatar: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    lessonReminders: boolean;
    achievements: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showProgress: boolean;
    showAchievements: boolean;
  };
  language: string;
}

const ProfileSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: 'Alex Johnson',
    email: 'alex@example.com',
    bio: 'Passionate about blockchain technology and algorithmic problem solving.',
    walletAddress: 'ALGORITHM_WALLET_ADDRESS_PLACEHOLDER',
    avatar: '/api/placeholder/120/120',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      lessonReminders: true,
      achievements: true,
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
    },
    language: 'en',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreferenceChange = (section: keyof UserPreferences, field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-primary-100">Manage your account settings and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-dark-700">
            <nav className="flex space-x-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-primary-400 bg-dark-700'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-dark-750'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LazyImage
                        src={avatarPreview || formData.avatar}
                        alt="Profile Avatar"
                        width={120}
                        height={120}
                        className="w-30 h-30 rounded-full object-cover border-4 border-primary-500"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">Profile Photo</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Click on the image to upload a new avatar. JPG, PNG formats supported.
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload New Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Display Name"
                      value={formData.displayName}
                      onChange={(value) => handleInputChange('displayName', value)}
                      placeholder="Enter your display name"
                      validation={{
                        minLength: 2,
                        maxLength: 50,
                      }}
                    />
                    
                    <InputField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      placeholder="Enter your email"
                      validation={{
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        custom: (value) => {
                          if (!value.includes('@')) return 'Please enter a valid email address';
                          return null;
                        }
                      }}
                    />

                    <div className="md:col-span-2">
                      <InputField
                        label="Wallet Address"
                        value={formData.walletAddress}
                        onChange={(value) => handleInputChange('walletAddress', value)}
                        placeholder="Enter your Algorand wallet address"
                        validation={{
                          minLength: 58,
                          maxLength: 58,
                          custom: (value) => {
                            if (value.length === 58 && /^[A-Z2-7]+$/.test(value)) return null;
                            return 'Please enter a valid 58-character Algorand address';
                          }
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          Share a bit about your interests and goals
                        </p>
                        <span className="text-xs text-gray-400">
                          {formData.bio.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-yellow-500 font-medium">Security Notice</h3>
                    </div>
                    <p className="text-yellow-200 text-sm mt-2">
                      Changing your password will log you out of all other sessions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <InputField
                        label="Current Password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(value) => handleInputChange('currentPassword', value)}
                        placeholder="Enter current password"
                        validation={{
                          minLength: 8,
                          custom: (value) => {
                            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                              return 'Password must contain uppercase, lowercase, and number';
                            }
                            return null;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <InputField
                        label="New Password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(value) => handleInputChange('newPassword', value)}
                        placeholder="Enter new password"
                        validation={{
                          minLength: 8,
                          custom: (value) => {
                            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
                              return 'Password must contain uppercase, lowercase, number, and special character';
                            }
                            return null;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <InputField
                        label="Confirm New Password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(value) => handleInputChange('confirmPassword', value)}
                        placeholder="Confirm new password"
                        validation={{
                          custom: (value: string) => {
                            if (value !== formData.newPassword) {
                              return 'Passwords do not match';
                            }
                            return null;
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <span>Appearance</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Globe },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handlePreferenceChange('theme', 'theme', value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            preferences.theme === value
                              ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                              : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium text-white">{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>Language</span>
                    </h3>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', 'language', e.target.value)}
                      className="w-full max-w-xs px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <button
                            onClick={() => handlePreferenceChange('notifications', key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-dark-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Privacy</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Profile Visibility</label>
                        <select
                          value={preferences.privacy.profileVisibility}
                          onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
                          className="w-full max-w-xs px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      
                      {Object.entries(preferences.privacy)
                        .filter(([key]) => key !== 'profileVisibility')
                        .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <button
                            onClick={() => handlePreferenceChange('privacy', key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-dark-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save Button */}
          <div className="bg-dark-750 px-6 py-4 border-t border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AnimatePresence>
                  {saveStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 text-green-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Settings saved successfully!</span>
                    </motion.div>
                  )}
                  {saveStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 text-red-400"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Failed to save settings</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;