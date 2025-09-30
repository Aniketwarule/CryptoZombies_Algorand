import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Home, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface OfflinePageProps {
  onRetry?: () => void;
  showCacheStatus?: boolean;
}

const OfflinePage: React.FC<OfflinePageProps> = ({ 
  onRetry, 
  showCacheStatus = true 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{name: string, size: number}[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
      
      // Auto retry when back online
      setTimeout(() => {
        handleRetry();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cache info if available
    loadCacheInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheInfo = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const info = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return { name, size: keys.length };
          })
        );
        setCacheInfo(info);
      } catch (error) {
        console.error('Failed to load cache info:', error);
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a simple endpoint to test connectivity
      await fetch('/?_test=1', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      // If successful, call onRetry or reload
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.log('Still offline, retry failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCacheInfo([]);
        
        // Show success message and reload
        alert('Cache cleared successfully. The page will now reload.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('Failed to clear cache. Please try again.');
      }
    }
  };

  const totalCachedItems = cacheInfo.reduce((sum, cache) => sum + cache.size, 0);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-dark-800 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center">
          <motion.div
            animate={{ 
              rotate: isOnline ? 0 : [0, -10, 10, -10, 0],
              scale: isOnline ? 1 : [1, 1.1, 1]
            }}
            transition={{ 
              duration: isOnline ? 0.3 : 2,
              repeat: isOnline ? 0 : Infinity,
              repeatDelay: 3
            }}
            className="inline-block mb-4"
          >
            {isOnline ? (
              <Wifi className="w-16 h-16 text-white" />
            ) : (
              <WifiOff className="w-16 h-16 text-white" />
            )}
          </motion.div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-red-100">
            {isOnline 
              ? 'Your internet connection has been restored.'
              : 'Check your internet connection and try again.'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className={`flex items-center space-x-3 p-4 rounded-lg ${
            isOnline ? 'bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20' : 
                      'bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20'
          }`}>
            {isOnline ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-400">
                {isOnline 
                  ? lastSync ? `Connected at ${lastSync.toLocaleTimeString()}` : 'Connected'
                  : 'Unable to reach AlgoZombies servers'
                }
              </p>
            </div>
          </div>

          {/* Cache Status */}
          {showCacheStatus && cacheInfo.length > 0 && (
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Download className="w-4 h-4 text-primary-400" />
                <h3 className="font-medium text-white">Cached Content</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  {totalCachedItems} items cached for offline access
                </p>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {cacheInfo.map((cache, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300 truncate">
                        {cache.name.replace('algozombies-', '')}
                      </span>
                      <span className="text-gray-400">
                        {cache.size} items
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Available Actions */}
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                <span>Browse cached lessons and content</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                <span>Continue working on code exercises</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                <span>Review your progress (syncs when online)</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <motion.div
                animate={isRetrying ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRetrying ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span>{isRetrying ? 'Checking...' : 'Try Again'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={goHome}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>

              {cacheInfo.length > 0 && (
                <button
                  onClick={clearCache}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Cache</span>
                </button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 Tip: Your progress will automatically sync when you're back online</p>
            <p>⚡ AlgoZombies works offline with cached content</p>
          </div>
        </div>

        {/* Auto-retry indicator */}
        <AnimatePresence>
          {isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500 bg-opacity-20 border-t border-green-500 border-opacity-30 px-6 py-3"
            >
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connection restored! Redirecting...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OfflinePage;