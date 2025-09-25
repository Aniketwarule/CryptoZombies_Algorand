// Enhanced wallet management hook with better state handling
import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';
import { storage } from '../utils/storage';

export interface WalletConnection {
  address: string;
  balance: number;
  connector: 'pera' | 'defly' | 'myalgo' | 'walletconnect';
  network: 'testnet' | 'mainnet';
}

export interface UseWalletReturn extends WalletState {
  connect: (connector?: WalletConnection['connector']) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  switchNetwork: (network: 'testnet' | 'mainnet') => Promise<void>;
  refreshBalance: () => Promise<void>;
  getTransactionHistory: () => Promise<any[]>;
}

export const useEnhancedWallet = (): UseWalletReturn => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    loading: false,
    error: null,
  });

  // Load saved wallet data on mount
  useEffect(() => {
    const savedWallet = storage.get('algozombies-wallet');
    if (savedWallet && savedWallet.address) {
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address: savedWallet.address,
        balance: savedWallet.balance,
      }));
    }
  }, []);

  const connect = useCallback(async (connector: WalletConnection['connector'] = 'pera') => {
    setWalletState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate wallet connection based on connector type
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock connection logic - in real app, this would use actual wallet SDKs
      const mockWallets = {
        pera: { address: 'PERA7X2KQJH4ZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', balance: 145.67 },
        defly: { address: 'DEFLY2KQJH4ZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', balance: 89.23 },
        myalgo: { address: 'MYALG3KQJH4ZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', balance: 201.45 },
        walletconnect: { address: 'WC4KQJH4ZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', balance: 67.89 }
      };

      const walletInfo = mockWallets[connector];

      const newWalletState = {
        isConnected: true,
        address: walletInfo.address,
        balance: walletInfo.balance,
        loading: false,
        error: null,
      };

      setWalletState(newWalletState);

      // Save to storage
      storage.set('algozombies-wallet', {
        address: walletInfo.address,
        balance: walletInfo.balance,
        lastConnected: new Date(),
      });

    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      loading: false,
      error: null,
    });
    storage.remove('algozombies-wallet');
  }, []);

  const reconnect = useCallback(async () => {
    const savedWallet = storage.get('algozombies-wallet');
    if (savedWallet?.address) {
      await connect();
    }
  }, [connect]);

  const switchNetwork = useCallback(async (network: 'testnet' | 'mainnet') => {
    setWalletState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate network switch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would switch the network
      console.log(`Switched to ${network}`);
      
      setWalletState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to switch network',
      }));
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletState.address) return;

    setWalletState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate balance refresh
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newBalance = Math.random() * 200 + 50; // Mock new balance
      
      setWalletState(prev => ({
        ...prev,
        balance: parseFloat(newBalance.toFixed(2)),
        loading: false,
      }));

      // Update storage
      const savedWallet = storage.get('algozombies-wallet');
      if (savedWallet) {
        storage.set('algozombies-wallet', {
          ...savedWallet,
          balance: parseFloat(newBalance.toFixed(2)),
        });
      }
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to refresh balance',
      }));
    }
  }, [walletState.address]);

  const getTransactionHistory = useCallback(async () => {
    if (!walletState.address) return [];

    try {
      // Mock transaction history
      return [
        {
          id: 'TXN1',
          type: 'payment',
          amount: 10,
          timestamp: new Date(Date.now() - 86400000),
          status: 'confirmed'
        },
        {
          id: 'TXN2',
          type: 'asset_transfer',
          amount: 5,
          timestamp: new Date(Date.now() - 172800000),
          status: 'confirmed'
        }
      ];
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }, [walletState.address]);

  return {
    ...walletState,
    connect,
    disconnect,
    reconnect,
    switchNetwork,
    refreshBalance,
    getTransactionHistory,
  };
};