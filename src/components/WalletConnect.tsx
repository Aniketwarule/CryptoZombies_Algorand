import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const WalletConnect = () => {
  const { 
    isConnected, 
    address, 
    isConnecting, 
    connect, 
    disconnect, 
    balance 
  } = useWallet();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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