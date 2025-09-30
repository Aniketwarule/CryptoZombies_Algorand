import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, LogOut, ChevronDown, Copy, CheckCircle, 
  ExternalLink, Shield, Activity, TrendingUp, AlertCircle 
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useNotificationHelpers } from './NotificationSystem';

interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  isInstalled?: boolean;
  downloadUrl?: string;
}

const WalletConnect = () => {
  const { 
    isConnected, 
    address, 
    isConnecting, 
    connect, 
    disconnect, 
    balance 
  } = useWallet();
  
  const { showSuccess, showError } = useNotificationHelpers();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'stable' | 'unstable' | 'slow'>('stable');
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  // Monitor connection status
  React.useEffect(() => {
    if (!isConnected) return;

    const checkConnectionStatus = () => {
      // Simulate connection monitoring
      const statuses: ('stable' | 'unstable' | 'slow')[] = ['stable', 'stable', 'stable', 'slow', 'unstable'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setConnectionStatus(randomStatus);
      setLastSyncTime(new Date());
    };

    // Initial check
    checkConnectionStatus();
    
    // Check every 10 seconds
    const interval = setInterval(checkConnectionStatus, 10000);
    
    return () => clearInterval(interval);
  }, [isConnected]);
  const [showProviders, setShowProviders] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [recentTransactions, setRecentTransactions] = React.useState<any[]>([]);

  // Mock wallet providers
  const walletProviders: WalletProvider[] = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      icon: '🟢',
      description: 'Official Algorand wallet',
      isInstalled: true
    },
    {
      id: 'myalgo',
      name: 'MyAlgo',
      icon: '🔵',
      description: 'Web-based Algorand wallet',
      isInstalled: true
    },
    {
      id: 'defly',
      name: 'Defly',
      icon: '🟣',
      description: 'Mobile-first Algorand wallet',
      isInstalled: false,
      downloadUrl: 'https://defly.app'
    }
  ];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        showSuccess('Address copied!', 'Wallet address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        showError('Copy failed', 'Could not copy address to clipboard');
      }
    }
  };

  const handleConnect = async (providerId: string) => {
    try {
      await connect(providerId);
      showSuccess('Wallet connected!', `Successfully connected to ${providerId}`);
      setShowProviders(false);
    } catch (error) {
      showError('Connection failed', `Failed to connect to ${providerId}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      showSuccess('Wallet disconnected', 'Successfully disconnected wallet');
      setShowDropdown(false);
    } catch (error) {
      showError('Disconnect failed', 'Failed to disconnect wallet');
    }
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(bal);
  };

  // Mock recent transactions
  const getRecentTransactions = () => [
    { id: 1, type: 'receive', amount: 5.25, hash: 'ABC123...', timestamp: Date.now() - 3600000 },
    { id: 2, type: 'send', amount: -2.1, hash: 'DEF456...', timestamp: Date.now() - 7200000 },
    { id: 3, type: 'contract', amount: 0, hash: 'GHI789...', timestamp: Date.now() - 10800000 },
  ];

  if (isConnected && address) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:block">{truncateAddress(address)}</span>
          <ChevronDown className="h-4 w-4" />
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-lg shadow-lg border border-dark-700 z-50"
            >
              <div className="p-4 border-b border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Connection Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'stable' ? 'bg-green-500' :
                      connectionStatus === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-xs capitalize ${
                      connectionStatus === 'stable' ? 'text-green-400' :
                      connectionStatus === 'slow' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {connectionStatus}
                    </span>
                  </div>
                </div>
                {lastSyncTime && (
                  <p className="text-xs text-gray-500 mb-3">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </p>
                )}
                <p className="text-sm text-gray-400">Connected Address</p>
                <p className="font-mono text-sm">{truncateAddress(address)}</p>
                <p className="text-sm text-gray-400 mt-2">Balance</p>
                <p className="font-mono text-sm text-primary-500">{balance} ALGO</p>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full p-3 text-left text-red-400 hover:bg-dark-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Wallet className="h-4 w-4" />
      <span>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </span>
    </motion.button>
  );
};

export default WalletConnect;