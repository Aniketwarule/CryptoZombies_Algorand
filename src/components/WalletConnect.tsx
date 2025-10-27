import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useNotificationHelpers } from './NotificationSystem';

const WalletConnect = React.memo(() => {
  const { 
    isConnected, 
    address, 
    isConnecting, 
    connect, 
    disconnect, 
    balance,
    getBalance
  } = useWallet();
  
  const { showSuccess, showError } = useNotificationHelpers();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date>(new Date());

  // Update sync time when balance changes
  React.useEffect(() => {
    if (isConnected && balance > 0) {
      setLastSyncTime(new Date());
    }
  }, [isConnected, balance]);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      await connect();
      showSuccess('Wallet connected!', 'Successfully connected to wallet');
    } catch (error) {
      showError('Connection failed', 'Failed to connect wallet');
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

  const handleRefreshBalance = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      await getBalance(address);
      setLastSyncTime(new Date());
      showSuccess('Balance updated', 'Wallet balance refreshed successfully');
    } catch (error) {
      showError('Refresh failed', 'Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

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
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-400">Connected Address</p>
                <p className="font-mono text-sm break-all mb-3">{address}</p>
                
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-400">Balance</p>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-dark-600 rounded transition-colors disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`h-3 w-3 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="font-mono text-lg font-semibold text-primary-400">{balance.toFixed(6)} ALGO</p>
              </div>
              <button
                onClick={handleDisconnect}
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
      onClick={handleConnect}
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
});

WalletConnect.displayName = 'WalletConnect';

export default WalletConnect;