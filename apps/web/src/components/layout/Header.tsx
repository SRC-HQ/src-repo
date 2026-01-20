'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGameStore } from '@/stores/gameStore';
import { LAMPORTS_PER_SOL } from '@sperm-race/shared';

export function Header() {
  const totalPool = useGameStore((state) => state.totalPool);
  const roundId = useGameStore((state) => state.roundId);

  return (
    <header className="border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏊</span>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Sperm Race
              </h1>
              <p className="text-xs text-gray-400">Bet • Race • Win</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-400">Current Pool</p>
              <p className="text-lg font-bold text-game-accent">
                {(totalPool / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Round</p>
              <p className="text-lg font-bold">#{roundId}</p>
            </div>
          </div>

          {/* Wallet Button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
