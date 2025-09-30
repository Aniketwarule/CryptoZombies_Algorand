import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Eye, Download, Upload } from 'lucide-react';
import { themes, ThemeName } from '../constants/themes';
import { storage } from '../utils/storage';

interface ThemeCustomizerProps {
  currentTheme: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
  className?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentTheme,
  onThemeChange,
  className = ''
}) => {
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePreview = (themeName: ThemeName) => {
    setPreviewTheme(themeName);
    // Apply preview theme temporarily
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const handleApply = (themeName: ThemeName) => {
    onThemeChange(themeName);
    setPreviewTheme(null);
    storage.set('algozombies-theme', themeName);
  };

  const handleResetPreview = () => {
    setPreviewTheme(null);
    document.documentElement.setAttribute('data-theme', currentTheme);
  };

  const exportThemeSettings = () => {
    const settings = {
      currentTheme,
      customizations: JSON.parse(localStorage.getItem('algozombies-theme-customizations') || '{}'),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algozombies-theme-${currentTheme}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importThemeSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.currentTheme && themes[settings.currentTheme as ThemeName]) {
          onThemeChange(settings.currentTheme);
          if (settings.customizations) {
            localStorage.setItem('algozombies-theme-customizations', JSON.stringify(settings.customizations));
          }
        }
      } catch (error) {
        console.error('Failed to import theme settings:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`bg-dark-800 rounded-lg border border-dark-600 ${className}`}>
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Palette className="h-5 w-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-semibold text-white">Theme Customizer</h3>
            <p className="text-sm text-gray-400">
              Current: {themes[currentTheme].name}
              {previewTheme && ` (Previewing: ${themes[previewTheme].name})`}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          ↓
        </motion.div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-dark-600 p-4"
        >
          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(themes).map(([key, theme]) => {
              const themeName = key as ThemeName;
              const isActive = currentTheme === themeName;
              const isPreviewing = previewTheme === themeName;
              
              return (
                <motion.div
                  key={themeName}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isActive ? 'border-primary-500 bg-primary-900/20' : 'border-dark-600 hover:border-dark-500'}
                    ${isPreviewing ? 'ring-2 ring-yellow-500' : ''}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Theme Preview */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{theme.name}</h4>
                    {isActive && <Check className="h-4 w-4 text-primary-500" />}
                  </div>
                  
                  {/* Color Palette Preview */}
                  <div className="flex space-x-2 mb-3">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors.background.secondary }}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(themeName);
                      }}
                      className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(themeName);
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>Apply</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Preview Controls */}
          {previewTheme && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-200">
                    Previewing: {themes[previewTheme].name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApply(previewTheme)}
                    className="bg-primary-600 hover:bg-primary-700 text-white py-1 px-3 rounded text-sm transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleResetPreview}
                    className="bg-dark-600 hover:bg-dark-500 text-white py-1 px-3 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import/Export */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={exportThemeSettings}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Settings</span>
            </button>
            <label className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import Settings</span>
              <input
                type="file"
                accept=".json"
                onChange={importThemeSettings}
                className="hidden"
              />
            </label>
          </div>
        </motion.div>
      )}
    </div>
  );
};