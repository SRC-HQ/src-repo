export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const INTERPOLATION_FACTOR = 0.15;
// Game simulation uses a raw WebSocket (SYNC_STATE, TICK, MODE_CHANGE) - different from API.
// The API uses Socket.io, so keep MOCK unless you have a separate raw WS game server.
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_GAME_WS_URL || 'MOCK';

/**
 * Socket.io URL for API game state (phase, countdown, pool).
 * Format per WEBSOCKET_ARCHITECTURE.md: ws://host:4000/game (or wss:// for production).
 * Prefer NEXT_PUBLIC_WS_URL; fallback: derive from NEXT_PUBLIC_API_URL.
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
