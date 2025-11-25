# 🚀 AlgoZombies Quick Reference

## Start Development

### LocalNet
```bash
# Terminal 1: Start AlgoKit LocalNet
algokit localnet start

# Terminal 2: Start Frontend
cd "d:\Algo Hackseries-2\algoZombiesSetup\projects\algoZombiesSetup-frontend"
npm run dev
```
**Access:** http://localhost:3000

### TestNet
1. Edit `.env.local` - uncomment TestNet config
2. Run: `npm run dev`

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run generate:app-clients` | Generate contract clients |
| `npm run type-check` | Check TypeScript types |
| `npm run lint:fix` | Fix linting issues |

## File Locations

| What | Where |
|------|-------|
| Components | `src/components/` |
| Pages | `src/pages/` |
| Smart Contract Clients | `src/contracts/` |
| Utilities | `src/utils/` |
| Environment Config | `.env.local` |
| Build Output | `dist/` |

## Network Configuration

**LocalNet** (Default in `.env.local`)
- Algod: http://localhost:4001
- Indexer: http://localhost:8980
- Wallet: KMD

**TestNet** (Uncomment in `.env.local`)
- Algod: https://testnet-api.algonode.cloud
- Indexer: https://testnet-idx.algonode.cloud
- Wallets: Pera, Defly, Exodus

## Wallet Support

- **LocalNet:** KMD
- **TestNet/MainNet:** Pera, Defly, Exodus

## Key Features

✅ Interactive Monaco code editor
✅ 6 theme options
✅ Progress tracking
✅ Offline support
✅ Multi-wallet support
✅ Smart contract integration
✅ Responsive design

## Troubleshooting

**Port 3000 in use?**
```bash
# Kill the process or change port in vite.config.ts
```

**Wallet not connecting?**
- LocalNet: Check `algokit localnet status`
- TestNet: Check wallet extension and internet

**Build errors?**
```bash
npm run clean && npm install && npm run build
```

**Contract client errors?**
```bash
cd ../algoZombiesSetup-contracts && npm run build
cd ../algoZombiesSetup-frontend && npm run generate:app-clients
```

## Project Structure

```
algoZombiesSetup-frontend/
├── src/
│   ├── components/     # UI components
│   ├── pages/         # Route pages
│   ├── contracts/     # Generated clients ⚡
│   ├── utils/         # Helpers
│   └── App.tsx        # Main app
├── .env.local         # Your config 🔧
└── package.json       # Dependencies
```

## Documentation

📖 **MIGRATION_COMPLETE.md** - Full migration details
📖 **MIGRATION_README.md** - Setup guide
📖 **.env.template** - Environment reference

## Quick Links

- **Frontend:** http://localhost:3000
- **LocalNet Algod:** http://localhost:4001
- **LocalNet Indexer:** http://localhost:8980

---

## 🎯 You're Ready!

Everything is set up and working. Just run `npm run dev` to start coding! 🧟‍♂️⚡

**Questions?** Check MIGRATION_COMPLETE.md for detailed info.
