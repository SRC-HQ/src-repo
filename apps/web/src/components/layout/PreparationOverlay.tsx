'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import SpmSwimSprite from '../sprites/SpmSwimSprite';
import { RACER_COLORS } from '../../game/constants';

const RACER_COUNT = 10;
const GAME_HEIGHT = 720;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X_PERCENT = (60 / 1280) * 100;
/** Offset to prevent top sperms (#0, #1) from being clipped by header/overflow */
const TOP_OFFSET_PERCENT = 8;

const laneTopPercent = (spermId: number) =>
  ((START_Y + spermId * LANE_HEIGHT) / GAME_HEIGHT) * 100 + TOP_OFFSET_PERCENT;

export const PreparationOverlay: React.FC = () => {
  const apiSperms = useGameStore((s) => s.apiSperms);

  const getBettorCount = (spermId: number) =>
    apiSperms?.find((s) => s.spermId === spermId)?.bettorCount ?? 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {Array.from({ length: RACER_COUNT }).map((_, spermId) => {
        const bettorCount = getBettorCount(spermId);

        return (
          <div
            key={spermId}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: `${START_X_PERCENT}%`,
              top: `${laneTopPercent(spermId)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <SpmSwimSprite
              color={RACER_COLORS[spermId % RACER_COLORS.length]}
              width={50}
              height={50}
              animating={true}
              className="shrink-0"
            />
            <span className="text-xs font-sans text-white drop-shadow-lg whitespace-nowrap">
              #{spermId + 1} • {bettorCount}
            </span>
          </div>
        );
      })}
    </div>
  );
};
