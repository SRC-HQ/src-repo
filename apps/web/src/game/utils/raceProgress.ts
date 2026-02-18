import type { SpermRaceParams } from '../../store/gameStore';

/**
 * Compute progress (0–1) at normalized time t for a sperm with optional segments.
 */
export function progressAtT(params: SpermRaceParams, t: number): number {
  const { baseSpeed, segments } = params;
  if (!segments?.length) return t * baseSpeed;
  let total = 0;
  for (const seg of segments) {
    const segStart = Math.max(seg.from, 0);
    const segEnd = Math.min(seg.to, t);
    if (segEnd > segStart) {
      total += (segEnd - segStart) * baseSpeed * seg.mult;
    }
    if (seg.to >= t) break;
  }
  return total;
}

/**
 * Max base speed (winner always has 1.0).
 */
export const MAX_BASE_SPEED = 1;
