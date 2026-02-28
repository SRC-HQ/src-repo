// Base canvas dimensions (landscape)
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;

// Content safe zone dimensions
export const CONTENT_WIDTH = 1024;
export const CONTENT_HEIGHT = 576;

// Portrait mode dimensions
export const PORTRAIT_WIDTH = 768;
export const PORTRAIT_HEIGHT = 1024;
export const PORTRAIT_CONTENT_WIDTH = 576;
export const PORTRAIT_CONTENT_HEIGHT = 900;

export const INTERPOLATION_FACTOR = 0.15;

/**
 * Socket.io URL for API game state (phase, countdown, pool).
 * Set NEXT_PUBLIC_WS_URL in .env (e.g. wss://api.spermrace.club/game).
 * Fallback: derives from NEXT_PUBLIC_API_URL by replacing http→ws and appending /game.
 */
export const API_SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws')}/game`
    : '');

// Define 10 distinct colors for racers
export const RACER_COLORS = [
  '#FF5733', // Red/Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F033FF', // Magenta
  '#FF33A8', // Pink
  '#33FFF5', // Cyan
  '#F5FF33', // Yellow
  '#FF8C33', // Orange
  '#8C33FF', // Purple
  '#33FF99', // Mint
];
