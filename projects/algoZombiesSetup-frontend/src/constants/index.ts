// App-wide constants and configuration
export const APP_CONFIG = {
  name: 'AlgoZombies',
  version: '1.0.0',
  description: 'Learn Algorand smart contracts through interactive coding challenges',
  author: 'AlgoZombies Team',
  repository: 'https://github.com/Aniketwarule/CryptoZombies_Algorand'
};

export const LESSON_CONFIG = {
  totalLessons: 6,
  estimatedTimePerLesson: 15, // minutes
  difficultyLevels: ['beginner', 'intermediate', 'advanced'] as const,
  categories: ['basics', 'smart-contracts', 'pyteal', 'dapps'] as const
};

export const WALLET_CONFIG = {
  supportedWallets: ['Pera', 'Defly', 'MyAlgo', 'WalletConnect'],
  networkId: 'testnet',
  nodeUrl: 'https://testnet-api.algonode.cloud'
};

export const UI_CONFIG = {
  theme: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    dark: {
      900: '#0F172A',
      800: '#1E293B',
      700: '#334155'
    }
  },
  animations: {
    duration: 200,
    easing: 'ease-in-out'
  }
};