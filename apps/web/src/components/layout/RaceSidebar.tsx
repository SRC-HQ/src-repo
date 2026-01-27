import React from 'react';
import Image from 'next/image';

export const RaceSidebar = () => {
  const entries = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    name: 'nY7...bI8',
    amount: '8.1599',
    color: ['bg-purple-400', 'bg-amber-700', 'bg-pink-400', 'bg-emerald-400', 'bg-blue-400'][i % 5],
  }));

  return (
    <div className="w-80 flex-shrink-0 bg-black border-r border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="relative w-6 h-6">
          <Image src="/assets/src-logo.png" alt="Sperm Race Club" fill className="object-contain" />
        </div>
        <span className="font-bold text-white uppercase tracking-wider text-sm font-sans">
          Sperm Race Club
        </span>
      </div>

      {/* Title */}
      <div className="py-6 flex justify-center">
        <h2
          className="text-2xl font-bold text-primary uppercase font-sans tracking-wide"
          style={{ textShadow: '0 0 10px rgba(182, 176, 255, 0.5)' }}
        >
          Active Entry
        </h2>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 group">
            {/* Status Circle */}
            <div className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-primary transition-colors"></div>

            {/* Name */}
            <span className="font-mono text-white/90 text-lg flex-1">{entry.name}</span>

            {/* Avatar Icon */}
            <div
              className={`w-8 h-8 rounded-full ${entry.color} flex items-center justify-center p-1.5`}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                <path d="M12 2C8 2 6 5 6 8C6 11 9 14 12 22C15 14 18 11 18 8C18 5 16 2 12 2ZM12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10Z" />
              </svg>
            </div>

            {/* Amount Badge */}
            <div className="bg-game-card px-2 py-1 rounded border border-white/10 flex items-center gap-1.5 min-w-[90px] justify-end">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-500 rounded-sm"></div>
              <span className="font-mono font-bold text-white text-sm">{entry.amount}</span>
            </div>
          </div>
        ))}

        <div className="text-center pt-4 pb-2">
          <span className="font-handwriting text-white/50 text-sm">Scroll down</span>
        </div>
      </div>
    </div>
  );
};
