// Main App component - routing and layout setup with Algokit wallet integration
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';
import { SnackbarProvider } from 'notistack';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import { PageLoading } from './components/Loading';
import { ProgressProvider } from './context/ProgressContext';
import { swManager } from './utils/serviceWorker';
import OfflinePage from './components/OfflinePage';
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const About = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));

// Configure supported wallets based on network
let supportedWallets: SupportedWallet[];
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment();
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ];
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
  ];
}

// App content component that has access to notifications
const AppContent: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { addNotification } = useNotifications();
  const location = useLocation();

  useEffect(() => {
    // Initialize service worker
    if (process.env.NODE_ENV === 'production') {
      swManager.register().then((registration) => {
        if (registration) {
          console.log('[App] Service worker registered successfully');
        }
      }).catch((error) => {
        console.error('[App] Service worker registration failed:', error);
      });
    }

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'Your progress will sync automatically.',
        duration: 5000
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      addNotification({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Some features may be limited.',
        duration: 8000
      });
    };

    // Custom events from service worker
    const handleAppOffline = () => setIsOffline(true);
    const handleAppOnline = () => setIsOffline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('app-offline', handleAppOffline);
    window.addEventListener('app-online', handleAppOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app-offline', handleAppOffline);
      window.removeEventListener('app-online', handleAppOnline);
    };
  }, [addNotification]);

  // Check for service worker updates
  useEffect(() => {
    const checkForUpdates = () => {
      if (swManager.isUpdateAvailable()) {
        addNotification({
          type: 'info',
          title: 'Update Available',
          message: 'A new version is available!',
          action: {
            label: 'Update',
            onClick: () => {
              swManager.activateUpdate().catch(console.error);
            }
          },
          duration: 0 // Persistent notification
        });
      }
    };

    // Check for updates when visibility changes (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(checkForUpdates, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addNotification]);

  // Show offline page for navigation errors when offline
  if (isOffline && location.pathname !== '/' && !navigator.onLine) {
    return <OfflinePage onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoading message="Loading AlgoZombies..." />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:lessonId" element={<LessonDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />

      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center space-x-2 z-50">
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <span>Offline Mode</span>
        </div>
      )}
    </div>
  );
};

function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment();

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  });

  return (
    <ErrorBoundary>
      <SnackbarProvider maxSnack={3}>
        <WalletProvider manager={walletManager}>
          <NotificationProvider>
            <ProgressProvider>
              <AppContent />
            </ProgressProvider>
          </NotificationProvider>
        </WalletProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
