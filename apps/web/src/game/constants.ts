export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const INTERPOLATION_FACTOR = 0.15;
// Default to 'MOCK' for demonstration purposes so you can see the loop running immediately.
// Set NEXT_PUBLIC_WS_URL to your actual server URL (e.g., ws://localhost:3000/game) to connect to backend.
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'MOCK';

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
