import React from 'react';
import Image from 'next/image';
import { Navbar } from './Navbar';
import { LeftSidebar } from './LeftSidebar';
import { RaceSidebar } from './RaceSidebar';
import { RightSidebar } from './RightSidebar';
import { GameHistory } from './GameHistory';
import { DebugPanel } from '../debug/DebugPanel';
import { useGameStore } from '../../store/gameStore';

interface GameLayoutProps {
  children: React.ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  const mode = useGameStore((state) => state.mode);

  return (
    <div className="fixed inset-0 flex flex-col bg-game-bg text-white overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 flex min-h-0 relative">
        {/* Left Sidebar */}
        {mode === 'PREPARATION' && <LeftSidebar />}
        {/* {(mode === 'RACE' || mode === 'DISTRIBUTION') && <RaceSidebar />} */}
        {(mode === 'RACE' || mode === 'DISTRIBUTION') && <LeftSidebar />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Game Canvas Container */}
          <main className="flex-1 relative bg-black/50 min-h-0">
            {children}

            {/* Overlay Gradient for visual depth */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>

            {/* Debug Panel Overlay */}
            <DebugPanel />
          </main>

          {/* Explore / History Table */}
          <div className="h-64 flex-shrink-0 bg-game-panel border-t border-white/10 z-10 relative">
            <GameHistory />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};
