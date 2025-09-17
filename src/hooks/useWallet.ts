import { useState, useEffect } from 'react';
import algosdk from 'algosdk';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  balance: number;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    balance: 0
  });

  // Mock Algorand client for TestNet
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  const connect = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Simulate wallet connection
      // In a real app, this would integrate with Pera, Defly, or MyAlgo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock account generation for demo
      const account = algosdk.generateAccount();
      const address = account.addr;
      
      // Mock balance (in a real app, this would fetch from the blockchain)
      const balance = Math.random() * 100;
      
      setWalletState({
        isConnected: true,
        address,
        isConnecting: false,
        balance: parseFloat(balance.toFixed(2))
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
        isConnecting: false 
      }));
    }
  };

  const disconnect = () => {
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
      balance: 0
    });
    localStorage.removeItem('algozombies-wallet');
  };

  const getBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      return algosdk.microAlgosToAlgos(accountInfo.amount);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return 0;
    }
  };

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('algozombies-wallet');
    if (stored) {
      try {
        const { address, balance } = JSON.parse(stored);
        // Ensure address is a valid string and balance is a valid number
        if (typeof address === 'string' && typeof balance === 'number') {
          setWalletState({
            isConnected: true,
            address,
            isConnecting: false,
            balance
          });
        } else {
          // Clear invalid data from localStorage
          localStorage.removeItem('algozombies-wallet');
        }
      } catch (error) {
        console.error('Failed to parse stored wallet data:', error);
        localStorage.removeItem('algozombies-wallet');
      }
    }
  }, []);

  return {
    ...walletState,
    connect,
    disconnect,
    getBalance
  };
};