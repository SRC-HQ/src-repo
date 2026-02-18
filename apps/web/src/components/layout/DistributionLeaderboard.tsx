'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import SpmSwimSprite from '../sprites/SpmSwimSprite';
import { RACER_COLORS } from '../../game/constants';

export const DistributionLeaderboard: React.FC = () => {
  const leaderboard = useGameStore((s) => s.leaderboard);
  const apiSperms = useGameStore((s) => s.apiSperms);

  if (!leaderboard?.length) return null;

  const getBettorCount = (spermId: number) =>
    apiSperms?.find((s) => s.spermId === spermId)?.bettorCount ?? 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 overflow-hidden">
      <div className="w-full max-w-md mx-4">
        <h2 className="text-center text-base font-bold text-white uppercase tracking-wider mb-3 font-sans">
          Race Results
        </h2>
        <div className="grid gap-1">
          {leaderboard.map((spermId, rank) => (
            <LeaderboardRow
              key={spermId}
              rank={rank + 1}
              spermId={spermId}
              bettorCount={getBettorCount(spermId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface LeaderboardRowProps {
  rank: number;
  spermId: number;
  bettorCount: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  spermId,
  bettorCount,
}) => {
  const color = RACER_COLORS[spermId % RACER_COLORS.length];
  const isWinner = rank === 1;

  return (
    <div
      className={`
        flex items-center gap-2 p-1.5 rounded-md border transition-colors
        ${isWinner ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'}
      `}
    >
      <span
        className={`
          w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0
          ${isWinner ? 'bg-primary text-white' : 'bg-white/10 text-white/80'}
        `}
      >
        {rank}
      </span>
      <div className="flex items-center gap-1.5 min-w-0">
        <SpmSwimSprite
          color={color}
          width={24}
          height={24}
          animating={true}
          className="shrink-0"
        />
        <div className="min-w-0">
          <span className="font-sans text-xs text-white block truncate">
            Sperm #{spermId + 1}
          </span>
          <span className="text-[10px] text-white/60 font-sans leading-tight">
            {bettorCount} user{bettorCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
