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
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
      <div className="w-full max-w-2xl mx-4">
        <h2 className="text-center text-xl font-bold text-white uppercase tracking-wider mb-6 font-sans">
          Race Results
        </h2>
        <div className="grid gap-2">
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
        flex items-center gap-4 p-3 rounded-lg border transition-colors
        ${isWinner ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'}
      `}
    >
      <span
        className={`
          w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0
          ${isWinner ? 'bg-primary text-white' : 'bg-white/10 text-white/80'}
        `}
      >
        {rank}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <SpmSwimSprite
          color={color}
          width={40}
          height={40}
          animating={true}
          className="shrink-0"
        />
        <div className="min-w-0">
          <span className="font-sans text-sm text-white block truncate">
            Sperm #{spermId + 1}
          </span>
          <span className="text-xs text-white/60 font-sans">
            {bettorCount} bettor{bettorCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
