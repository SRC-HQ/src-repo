'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { BettingPanel } from '@/components/betting/BettingPanel';
import { PhaseIndicator } from '@/components/game/PhaseIndicator';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';

// Dynamic import for PixiJS to avoid SSR issues
const GameCanvas = dynamic(
  () => import('@/components/game/GameCanvas').then((mod) => mod.GameCanvas),
  { ssr: false, loading: () => <GameCanvasPlaceholder /> },
);

function GameCanvasPlaceholder() {
  return (
    <div className="w-full h-[500px] bg-game-panel rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading game...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isConnected } = useSocket();
  const phase = useGameStore((state) => state.phase);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-4 p-3 bg-game-error/20 border border-game-error/50 rounded-lg text-center">
            <span className="text-game-error">⚠️ Connecting to game server...</span>
          </div>
        )}

        {/* Phase Indicator */}
        <PhaseIndicator />

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Game Canvas - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-4">
              <GameCanvas />
            </div>
          </div>

          {/* Betting Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <BettingPanel />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="🎲 Provably Fair"
            description="All results are determined by cryptographic RNG. Verify any round yourself!"
          />
          <InfoCard
            title="⚡ Instant Payouts"
            description="Winners receive their SOL immediately after each round."
          />
          <InfoCard
            title="🏆 Live Odds"
            description="Watch odds change in real-time as other players place their bets."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Built on Solana • Provably Fair • 18+ Only</p>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
