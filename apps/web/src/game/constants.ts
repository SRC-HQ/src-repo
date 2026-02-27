export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
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
