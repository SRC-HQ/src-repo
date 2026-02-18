'use client';

import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { GameHistory } from './GameHistory';
import { PreparationOverlay } from './PreparationOverlay';
import { RaceOverlay } from './RaceOverlay';
import { DistributionLeaderboard } from './DistributionLeaderboard';
import { DebugPanel } from '../debug/DebugPanel';
import { useGameStore } from '../../store/gameStore';
import { apiGameSocket } from '../../network/api-socket';

interface GameLayoutProps {
  children: React.ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  const mode = useGameStore((state) => state.mode);

  useEffect(() => {
    apiGameSocket.connect();
    return () => apiGameSocket.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-game-bg text-white overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 flex min-h-0 relative">
        <LeftSidebar />

        <div className="flex-1 flex flex-col min-w-0 relative">
          <main className="flex-1 relative bg-black/50 min-h-0">
            {children}

            {mode === 'PREPARATION' && <PreparationOverlay />}
            {mode === 'RACE' && <RaceOverlay />}
            {mode === 'DISTRIBUTION' && <DistributionLeaderboard />}

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20 z-0" />

            <DebugPanel />
          </main>

          <div className="h-64 flex-shrink-0 bg-game-panel border-t border-white/10 z-10 relative">
            <GameHistory />
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
};
