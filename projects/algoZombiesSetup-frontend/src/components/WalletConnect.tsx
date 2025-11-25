import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useNotificationHelpers } from './NotificationSystem';

const WalletConnect = React.memo(() => {
  const { 
    isConnected, 
    address, 
    isConnecting, 
    connect
  } = useWallet();
  
  const { showSuccess, showError } = useNotificationHelpers();

  // Debug: Log connection state
  React.useEffect(() => {
    console.log('WalletConnect - Connection state:', { isConnected, address });
  }, [isConnected, address]);

  const handleConnect = async () => {
    try {
      await connect();
      showSuccess('Wallet connected!', 'Successfully connected to wallet');
    } catch (error) {
      showError('Connection failed', 'Failed to connect wallet');
    }
  };

  // When connected, don't render in navbar (navbar shows profile instead)
  if (isConnected && address) {
    return null;
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