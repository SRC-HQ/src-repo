'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import SpmSwimSprite from '../sprites/SpmSwimSprite';
import { RACER_COLORS } from '../../game/constants';
import { progressAtT, MAX_BASE_SPEED } from '../../game/utils/raceProgress';

const RACER_COUNT = 10;
const GAME_HEIGHT = 720;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X_PERCENT = (60 / 1280) * 100;
const FINISH_X_PERCENT = (1100 / 1280) * 100;
/** Offset to prevent top sperms (#0, #1) from being clipped */
const TOP_OFFSET_PERCENT = 8;
const FALLBACK_RACE_DURATION_MS = 30_000;

const laneTopPercent = (spermId: number) =>
  ((START_Y + spermId * LANE_HEIGHT) / GAME_HEIGHT) * 100 + TOP_OFFSET_PERCENT;

export const RaceOverlay: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const mountTimeRef = useRef(Date.now());

  const apiPhaseStartedAt = useGameStore((s) => s.apiPhaseStartedAt);
  const apiPhaseEndsAt = useGameStore((s) => s.apiPhaseEndsAt);
  const apiPhaseReceivedAt = useGameStore((s) => s.apiPhaseReceivedAt);
  const raceParams = useGameStore((s) => s.raceParams);
  const apiSperms = useGameStore((s) => s.apiSperms);

  const duration = apiPhaseEndsAt - apiPhaseStartedAt;
  const hasValidTimestamps = duration > 0;
  const phaseStart = apiPhaseReceivedAt || apiPhaseStartedAt;
  const effectiveDuration = hasValidTimestamps
    ? duration
    : FALLBACK_RACE_DURATION_MS;
  const effectiveStart = hasValidTimestamps ? phaseStart : mountTimeRef.current;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const elapsed = Math.max(0, Date.now() - effectiveStart);
      const newT = effectiveDuration > 0 ? Math.min(1, elapsed / effectiveDuration) : 0;
      setProgress(newT);
      if (newT < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [effectiveStart, effectiveDuration]);

  /* Fallback when raceParams not yet received: show sperms at start with simple linear progress */
  const hasParams = raceParams && raceParams.length >= RACER_COUNT;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {Array.from({ length: RACER_COUNT }).map((_, spermId) => {
        let normalized: number;
        if (hasParams && raceParams[spermId]) {
          const prog = progressAtT(raceParams[spermId], progress);
          normalized = Math.min(1, prog / MAX_BASE_SPEED);
        } else {
          normalized = Math.min(1, progress);
        }
        const leftPercent =
          START_X_PERCENT + (FINISH_X_PERCENT - START_X_PERCENT) * normalized;
        const bettorCount =
          apiSperms?.find((s) => s.spermId === spermId)?.bettorCount ?? 0;

        return (
          <div
            key={spermId}
            className="absolute flex flex-col items-center gap-1 transition-none will-change-[left]"
            style={{
              left: `${leftPercent}%`,
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
