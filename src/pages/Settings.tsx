import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Palette, Bell, Lock, Download, Upload } from 'lucide-react';
import { storage } from '../utils/storage';
import { themes, ThemeName } from '../constants/themes';
import { LoadingSpinner } from '../components/Loading';

const Settings = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('dark');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simulate loading settings from storage
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const savedTheme = storage.get('algozombies-theme') || 'dark';
        setCurrentTheme(savedTheme as ThemeName);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleThemeChange = async (themeName: ThemeName) => {
    setIsSaving(true);
    try {
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTheme(themeName);
      storage.set('algozombies-theme', themeName);
      // Apply theme changes to document
      document.documentElement.setAttribute('data-theme', themeName);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    try {
      const backup = storage.backup();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algozombies-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = e.target?.result as string;
        if (storage.restore(backupData)) {
          alert('Data imported successfully!');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          control: (
            <div className="flex space-x-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key as ThemeName)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    currentTheme === key
                      ? 'border-primary-500 bg-primary-500/20'
                      : 'border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    {key === 'dark' && <Moon className="w-4 h-4" />}
                    {key === 'light' && <Sun className="w-4 h-4" />}
                    {key === 'cyberpunk' && <Palette className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      icon: SettingsIcon,
      items: [
        {
          label: 'Enable Notifications',
          description: 'Get notified about lesson completions and achievements',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          ),
        },
        {
          label: 'Auto-save Progress',
          description: 'Automatically save your code and progress',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          ),
        },
        {
          label: 'Language',
          description: 'Choose your preferred language',
          control: (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-dark-700 text-white border border-dark-600 rounded-lg px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: Lock,
      items: [
        {
          label: 'Export Data',
          description: 'Download your progress and settings as a backup file',
          control: (
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          ),
        },
        {
          label: 'Import Data',
          description: 'Restore your data from a backup file',
          control: (
            <label className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          ),
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">
            Settings
            {isSaving && (
              <span className="ml-3 inline-flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-400">Saving...</span>
              </span>
            )}
          </h1>
          
          <div className="space-y-8">
            {settingsSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="card"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <section.icon className="w-6 h-6 text-primary-500" />
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{item.label}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                      <div className="ml-4">
                        {item.control}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;