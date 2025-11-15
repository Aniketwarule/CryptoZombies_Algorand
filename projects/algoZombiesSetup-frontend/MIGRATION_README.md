# AlgoZombies Setup - Frontend

This is the AlgoZombies frontend integrated with Algokit for seamless smart contract interaction.

## Features

- 🧟 Interactive Algorand smart contract learning platform
- 🔐 Multi-wallet support (Pera, Defly, MyAlgo, KMD for localnet)
- 🎨 Modern, responsive UI with Tailwind CSS
- 📝 Monaco code editor for interactive coding
- 🔄 Service worker for offline support
- 📊 Progress tracking and state management
- 🧪 Integrated with Algokit for contract deployment

## Prerequisites

- Node.js >= 20.0
- npm >= 9.0
- Algokit CLI (for contract deployment)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.template` to `.env.local`
   - For LocalNet development, the default settings should work
   - For TestNet, uncomment the TestNet configuration section

3. **Generate app clients (connects to smart contracts):**
   ```bash
   npm run generate:app-clients
   ```

## Development

### Running the development server:
```bash
npm run dev
```

This will:
1. Generate/update the smart contract clients
2. Start the Vite dev server on http://localhost:3000

### Building for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Editor.tsx    # Monaco code editor
│   ├── Navbar.tsx    # Navigation bar
│   ├── WalletConnect.tsx  # Wallet connection UI
│   └── ...
├── pages/            # Route pages
│   ├── Dashboard.tsx
│   ├── Lessons.tsx
│   ├── LessonDetail.tsx
│   └── ...
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
│   ├── algorand.ts   # Algorand SDK helpers
│   ├── network/      # Algokit network configuration
│   └── ...
├── contracts/        # Generated smart contract clients
├── constants/        # App constants and themes
└── styles/          # Global styles
```

## Smart Contract Integration

This frontend is integrated with the Algokit-generated smart contracts from `algoZombiesSetup-contracts`.

### How it works:

1. Smart contracts are defined in `../algoZombiesSetup-contracts/smart_contracts/`
2. Running `npm run generate:app-clients` generates TypeScript clients in `src/contracts/`
3. These clients can be imported and used in your React components

### Example usage:
```typescript
import { ZombiesContractClient } from './contracts/ZombiesContract';
import { useWallet } from '@txnlab/use-wallet-react';

const { activeAddress, signer } = useWallet();

// Initialize client
const client = new ZombiesContractClient(
  { sender: activeAddress, signer },
  algodClient,
  appId
);

// Call contract method
await client.createZombie({ name: 'MyZombie' });
```

## Wallet Configuration

The app supports multiple wallet providers:

- **LocalNet:** Uses KMD (Key Management Daemon)
- **TestNet/MainNet:**
  - Pera Wallet
  - Defly Wallet
  - Exodus Wallet

Configuration is in `src/App.tsx`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
- `npm run generate:app-clients` - Generate smart contract clients

## Migration Notes

This frontend was migrated from the standalone AlgoZombies project and integrated with Algokit:

### Changes made:
1. ✅ Merged dependencies from both projects
2. ✅ Integrated Algokit wallet provider (@txnlab/use-wallet-react)
3. ✅ Added smart contract client generation
4. ✅ Configured Vite with necessary plugins and optimizations
5. ✅ Set up TypeScript with proper paths and references
6. ✅ Configured Tailwind CSS, PostCSS, and ESLint
7. ✅ Added environment variable configuration for multiple networks

### Preserved features:
- All AlgoZombies UI components
- Monaco code editor integration
- Progress tracking system
- Service worker for offline support
- Theme customization
- Notification system

## Troubleshooting

### Build errors:
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node -v` (should be >= 20.0)
- Try cleaning and rebuilding: `npm run clean && npm install && npm run build`

### Wallet connection issues:
- For LocalNet: Ensure Algokit LocalNet is running
- For TestNet: Check your internet connection and wallet extension
- Verify environment variables in `.env.local`

### Contract client errors:
- Run `npm run generate:app-clients` to regenerate clients
- Ensure the contracts project is built: `cd ../algoZombiesSetup-contracts && npm run build`

## Learn More

- [Algokit Documentation](https://developer.algorand.org/docs/get-started/algokit/)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT
