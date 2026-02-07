/**
 * Game configuration constants
 */

/** Number of sperms in each race */
export const SPERM_COUNT = 10;

/** Phase durations in milliseconds */
export const PHASE_DURATIONS = {
  /** Preparation phase: 1 minute */
  PREPARATION: 60_000,
  /** Resolution phase: 30 seconds */
  RESOLUTION: 30_000,
  /** Distribution phase: 30 seconds */
  DISTRIBUTION: 30_000,
} as const;

/** House fee percentage (0-100) */
export const HOUSE_FEE_PERCENT = 10;
export const BABY_KING_FEE_PERCENT = 5;