'use client';

import dynamic from 'next/dynamic';
import { GameLayout } from '../components/layout/GameLayout';

const RaceGame = dynamic(() => import('../components/RaceGame').then((m) => m.RaceGame), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-game-accent">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="uppercase tracking-widest text-xs">Loading Race Engine</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <GameLayout>
      <RaceGame />
    </GameLayout>
  );
}
