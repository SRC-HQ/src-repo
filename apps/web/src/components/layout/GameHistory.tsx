import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import SolColorIconSvg from '../svgs/SolColorIconSvg';

export const GameHistory = () => {
  const [mounted, setMounted] = useState(false);
  const [history] = useState(() =>
    Array.from({ length: 42 }).map((_, i) => ({
      race: `#${8042 - i}`,
      block: `#${Math.floor(Math.random() * 1000000) + 9000000}`,
      winnerIndex: Math.floor(Math.random() * 10),
      winnersCount: Math.floor(Math.random() * 800) + 100,
      totalPool: (Math.random() * 20 + 5).toFixed(4),
      babyKing: (Math.random() * 30 + 10).toFixed(1),
      time: i === 0 ? 'Just now' : i < 60 ? `${i * 10}s ago` : `${Math.floor((i * 10) / 60)}m ago`,
    })),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full overflow-hidden flex flex-col font-sans">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-game-bg z-10 shadow-sm shadow-black/20">
              <tr className="text-gray-400 font-sans">
                <th className="p-3 font-medium bg-game-bg">Race</th>
                <th className="p-3 font-medium bg-game-bg">Block</th>
                <th className="p-3 font-medium text-center bg-game-bg">1st</th>
                <th className="p-3 font-medium text-center bg-game-bg">Winners</th>
                <th className="p-3 font-medium text-right bg-game-bg">Total Pool</th>
                <th className="p-3 font-medium text-right bg-game-bg">Baby King</th>
                <th className="p-3 font-medium text-right bg-game-bg">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Skeleton or empty state for SSR */}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-game-bg z-10 shadow-sm shadow-black/20">
            <tr className="text-gray-400 font-sans">
              <th className="p-3 font-medium bg-game-bg">Race</th>
              <th className="p-3 font-medium bg-game-bg">Block</th>
              <th className="p-3 font-medium text-center bg-game-bg">1st</th>
              <th className="p-3 font-medium text-center bg-game-bg">Winners</th>
              <th className="p-3 font-medium text-right bg-game-bg">Total Pool</th>
              <th className="p-3 font-medium text-right bg-game-bg">Baby King</th>
              <th className="p-3 font-medium text-right bg-game-bg">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-game-bg">
            {history.map((item, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors font-sans">
                <td className="p-3 text-white">{item.race}</td>
                <td className="p-3 text-gray-500">{item.block}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center">
                    <div className="relative w-8 h-8 mt-2">
                      <Image
                        src={`/game/assets/icon_${String(item.winnerIndex + 1).padStart(2, '0')}.png`}
                        alt={`Racer ${item.winnerIndex + 1}`}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center text-white">{item.winnersCount}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <SolColorIconSvg className="w-3.5 h-3.5" />
                    <span className="text-game-accent">{item.totalPool}</span>
                  </div>
                </td>
                <td className="p-3 text-right text-gray-400">{item.babyKing}</td>
                <td className="p-3 text-right text-gray-500 text-[10px]">{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
