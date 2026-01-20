'use client';

import { useGameStore } from '@/stores/gameStore';
import { useCountdown } from '@/hooks/useCountdown';
import { GamePhase } from '@sperm-race/shared';

const phaseConfig = {
  [GamePhase.PREPARATION]: {
    label: 'Betting Open',
    description: 'Place your bets now!',
    color: 'text-game-warning',
    bgColor: 'bg-game-warning/20',
    borderColor: 'border-game-warning',
    icon: '🎰',
  },
  [GamePhase.RESOLUTION]: {
    label: 'Race In Progress',
    description: 'Watch the race unfold!',
    color: 'text-game-accent',
    bgColor: 'bg-game-accent/20',
    borderColor: 'border-game-accent',
    icon: '🏁',
  },
  [GamePhase.DISTRIBUTION]: {
    label: 'Results',
    description: 'Winners are being paid!',
    color: 'text-game-success',
    bgColor: 'bg-game-success/20',
    borderColor: 'border-game-success',
    icon: '💰',
  },
};

export function PhaseIndicator() {
  const phase = useGameStore((state) => state.phase);
  const phaseEndsAt = useGameStore((state) => state.phaseEndsAt);
  const commitment = useGameStore((state) => state.commitment);

  const { formatted, timeLeft } = useCountdown(phaseEndsAt);
  const config = phaseConfig[phase];

  return (
    <div className={`glass rounded-2xl p-4 border ${config.borderColor}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Phase Info */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl p-3 rounded-xl ${config.bgColor}`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xl ${config.color}`}>
                {config.label}
              </span>
              <span className="pulse-dot w-2 h-2 rounded-full bg-current" />
            </div>
            <p className="text-gray-400 text-sm">{config.description}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Time Remaining
          </p>
          <div
            className={`text-4xl font-mono font-bold ${config.color} ${
              timeLeft <= 10 ? 'animate-pulse' : ''
            }`}
          >
            {formatted}
          </div>
        </div>

        {/* RNG Commitment (only in preparation phase) */}
        {phase === GamePhase.PREPARATION && commitment && (
          <div className="hidden lg:block text-right">
            <p className="text-xs text-gray-400">RNG Commitment</p>
            <p className="font-mono text-xs text-gray-500 truncate max-w-[200px]">
              {commitment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
