# 🏊 Sperm Race - Web3 Betting Game

A provably fair Web3 betting game on Solana where players bet on racing sperms.

## 🏗️ Project Structure

```
sperm-race/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── game/       # Game loop, WebSocket gateway
│   │   │   │   ├── betting/    # Bet management
│   │   │   │   ├── rng/        # Provable RNG service
│   │   │   │   └── solana/     # Solana transaction service
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/            # Pages, layout, providers
│       │   ├── components/     # Game canvas, betting panel, header
│       │   ├── hooks/          # useSocket, useCountdown
│       │   └── stores/         # Zustand game store
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared types & constants
│   │   └── src/
│   │       ├── types/          # GamePhase, Bet, Events, etc.
│   │       └── constants/      # SPERM_COUNT, PHASE_DURATIONS, etc.
│   │
│   ├── contracts/              # Anchor Smart Contract
│   │   └── programs/sperm-race/src/lib.rs
│   │
│   └── anchor-client/          # TypeScript Anchor client
│       └── src/
│           ├── program.ts      # SpermRaceClient class
│           └── idl.ts          # IDL types
│
├── scripts/
│   ├── dev.sh                  # Start dev environment
│   └── generate-idl.sh         # Build contract & generate types
│
├── package.json                # Root config (Bun + Turborepo)
├── turbo.json                  # Build orchestration
├── env.example                 # Environment variables template
└── README.md                   # Documentation
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- [Rust](https://rustup.rs/) (for Anchor)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.30+)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd sperm-race

# Install dependencies
bun install

# Copy environment file
cp env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start all apps in development mode
bun run dev

# Or start individually
bun run --filter @sperm-race/web dev     # Frontend on http://localhost:3000
bun run --filter @sperm-race/api dev     # Backend on http://localhost:4000
```

### Building

```bash
# Build all packages
bun run build

# Build smart contract
bun run build:contracts

# Generate TypeScript types from IDL
bun run generate:idl
```

## 📦 Packages

### `@sperm-race/shared`
Shared TypeScript types, constants, and utilities used by both frontend and backend.

### `@sperm-race/contracts`
Anchor smart contract for handling:
- Bet deposits to escrow
- Winner payouts
- Fee collection

### `@sperm-race/anchor-client`
TypeScript client for interacting with the Anchor program.

### `@sperm-race/api`
NestJS backend handling:
- Game loop management
- WebSocket real-time updates
- Provable RNG
- Bet validation

### `@sperm-race/web`
Next.js frontend with:
- Solana wallet integration
- PixiJS game canvas
- Real-time betting interface

## 🎮 Game Flow

1. **Preparation Phase** (60s)
   - Players connect wallet
   - Players select sperm and bet amount
   - RNG commitment is published

2. **Resolution Phase** (20s)
   - Betting closes
   - RNG seed is revealed
   - Race animation plays
   - Winner determined

3. **Distribution Phase** (30s)
   - Results displayed
   - Winners can claim payouts
   - Loop restarts

## 🔐 Provable Fairness

The game uses a commit-reveal scheme:
1. Before betting opens, a hash (commitment) of the random seed is published
2. After betting closes, the actual seed is revealed
3. Anyone can verify: `hash(seed) === commitment`
4. Winner is deterministically derived from the seed

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, PixiJS, Tailwind |
| Backend | NestJS, Socket.io |
| Smart Contract | Anchor (Rust) |
| Database | PostgreSQL (production), In-memory (dev) |
| Blockchain | Solana |
| Package Manager | Bun |
| Monorepo | Turborepo |

## 📝 Environment Variables

See `env.example` for all required environment variables.

Key variables:
- `SOLANA_NETWORK` - devnet, testnet, or mainnet-beta
- `PROGRAM_ID` - Deployed Anchor program ID
- `HOUSE_FEE_PERCENT` - House fee (10-20%)

## 🚢 Deployment

### Smart Contract

```bash
# Build
cd packages/contracts
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Update PROGRAM_ID in .env with new program ID
```

### Backend

```bash
# Build
bun run --filter @sperm-race/api build

# Start production server
bun run --filter @sperm-race/api start:prod
```

### Frontend

```bash
# Build
bun run --filter @sperm-race/web build

# Deploy to Vercel, Netlify, etc.
```

## 📄 License

MIT

## ⚠️ Disclaimer

This is a betting application. Please gamble responsibly and be aware of the laws in your jurisdiction.
