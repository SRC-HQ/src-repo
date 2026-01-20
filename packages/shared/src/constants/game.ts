/**
 * Game configuration constants
 */

/** Number of sperms in each race */
export const SPERM_COUNT = 10;

/** Phase durations in milliseconds */
export const PHASE_DURATIONS = {
  /** Preparation phase: 1 minute */
  PREPARATION: 60_000,
  /** Resolution phase: 20 seconds */
  RESOLUTION: 20_000,
  /** Distribution phase: 30 seconds */
  DISTRIBUTION: 30_000,
} as const;

/** House fee percentage (0-100) */
export const HOUSE_FEE_PERCENT = 15;

/** Position updates per second during race animation */
export const RACE_FPS = 30;

/** Minimum time before phase end when bets are rejected (ms) */
export const BET_CUTOFF_MS = 5_000;

/** Sperm names for display */
export const SPERM_NAMES = [
  'Speedy',
  'Flasher',
  'Torpedo',
  'Rocket',
  'Bullet',
  'Bolt',
  'Dash',
  'Zoom',
  'Swift',
  'Turbo',
] as const;

/** Sperm colors for UI */
export const SPERM_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Sky
] as const;

/** Game canvas dimensions */
export const CANVAS = {
  WIDTH: 1200,
  HEIGHT: 600,
  LANE_HEIGHT: 50,
  START_X: 100,
  FINISH_X: 1100,
} as const;
