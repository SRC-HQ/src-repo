'use client';

import dynamic from 'next/dynamic';
import { GameLayout } from '../components/layout/GameLayout';

const RaceGame = dynamic(() => import('../components/RaceGame').then((m) => m.RaceGame), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/assets/loading/loader.png"
          alt="Loading"
          className="w-24 h-24 select-none animate-spin"
          draggable={false}
        />
        <div className="uppercase tracking-widest text-xs text-white">Loading...</div>
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
