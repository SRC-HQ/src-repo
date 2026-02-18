/**
 * Game configuration constants
 */

/** Number of sperms in each race */
export const SPERM_COUNT = 10;

/** Phase durations in milliseconds */
export const PHASE_DURATIONS = {
  /** Preparation phase: 1 minute */
  PREPARATION: 60_000,
  /** Resolution phase: 1 minute */
  RESOLUTION: 60_000,
  /** Distribution phase: 20 seconds */
  DISTRIBUTION: 20_000,
} as const;

/**
 * Conservative default ms per slot when cluster speed is unknown.
 * Assumes slower slots so end_slot is closer → we're always past it when we resolve.
 * App measures actual slot speed at runtime and uses it for subsequent rounds.
 */
export const DEFAULT_SLOT_MS = 500;

/** Bounds for observed slot ms (avoids bad measurements). Typical: 300–600ms. */
export const MIN_SLOT_MS = 300;
export const MAX_SLOT_MS = 800;

/**
 * Slots to subtract from "slots during preparation" so end_slot passes before we resolve.
 * Covers RPC delay, clock drift, and ensures slot hash is in SlotHashes when we call resolve.
 */
export const END_SLOT_BUFFER = 10;

/** House fee percentage (0-100) */
export const HOUSE_FEE_PERCENT = 10;
export const BABY_KING_FEE_PERCENT = 5;