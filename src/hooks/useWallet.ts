import { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  balance: number;
  error: string | null;
}

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect();

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    balance: 0,
    error: null
  });

  // Algorand client for TestNet
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  const connect = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Connect to Pera Wallet
      const accounts = await peraWallet.connect();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      
      // Fetch real balance from blockchain
      const balance = await getBalance(address);
      
      setWalletState({
        isConnected: true,
        address,
        isConnecting: false,
        balance: parseFloat(balance.toFixed(2)),
        error: null
      });

      // Store in localStorage for persistence
      localStorage.setItem('algozombies-wallet', JSON.stringify({
        address,
        balance: parseFloat(balance.toFixed(2))
      }));
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.'
      }));
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await peraWallet.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        isConnecting: false,
        balance: 0,
        error: null
      });
      localStorage.removeItem('algozombies-wallet');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const getBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const balance = algosdk.microalgosToAlgos(Number(accountInfo.amount));
      
      // Update the wallet state with the new balance
      setWalletState(prev => ({
        ...prev,
        balance: parseFloat(balance.toFixed(6))
      }));
      
      // Update localStorage
      localStorage.setItem('algozombies-wallet', JSON.stringify({
        address,
        balance: parseFloat(balance.toFixed(6))
      }));
      
      return balance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return 0;
    }
  };

  // Reconnect to Pera Wallet on mount if there was a previous session
  useEffect(() => {
    const reconnect = async () => {
      try {
        const accounts = await peraWallet.reconnectSession();
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = await getBalance(address);
          
          setWalletState({
            isConnected: true,
            address,
            isConnecting: false,
            balance: parseFloat(balance.toFixed(2)),
            error: null
          });

          // Store in localStorage
          localStorage.setItem('algozombies-wallet', JSON.stringify({
            address,
            balance: parseFloat(balance.toFixed(2))
          }));
        }
      } catch (error) {
        console.error('Failed to reconnect wallet:', error);
        localStorage.removeItem('algozombies-wallet');
      }
    };

    reconnect();

    // Listen for Pera Wallet disconnect event
    peraWallet.connector?.on('disconnect', () => {
      setWalletState({
        isConnected: false,
        address: null,
        isConnecting: false,
        balance: 0,
        error: null
      });
      localStorage.removeItem('algozombies-wallet');
    });
  }, []);

  return {
    ...walletState,
    connect,
    disconnect,
    getBalance,
    peraWallet
  };
};