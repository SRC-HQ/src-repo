import { GamePhase, PoolState, RoundResult } from './game';

// ===========================================
// Server -> Client Events
// ===========================================

/**
 * Emitted when game phase changes
 */
export interface PhaseChangeEvent {
  phase: GamePhase;
  roundId: number;
  /** Unix timestamp (ms) when phase ends */
  endsAt: number;
  /** RNG commitment (only in preparation phase) */
  commitment?: string;
}

/**
 * Emitted when race starts (resolution phase begins)
 */
export interface RaceStartEvent {
  roundId: number;
  /** Winning sperm ID (pre-determined) */
  winner: number;
  /** RNG seed for verification */
  seed: string;
  /** Unix timestamp (ms) when race ends */
  endsAt: number;
}

/**
 * Emitted during race with position updates
 */
export interface PositionsEvent {
  /** Array of positions (0-100) indexed by sperm ID */
  positions: number[];
  /** Current frame number */
  frame: number;
  /** Total frames in race */
  totalFrames: number;
}

/**
 * Emitted when a bet is placed and pool is updated
 */
export interface PoolUpdatedEvent {
  spermId: number;
  totalPool: number;
  /** Updated odds for all sperms */
  odds: number[];
  /** Updated pools for all sperms */
  pools: PoolState[];
}

/**
 * Emitted when distribution phase completes
 */
export interface DistributionEvent {
  roundId: number;
  result: RoundResult;
  /** List of winners and their payouts */
  winners: WinnerPayout[];
}

export interface WinnerPayout {
  walletAddress: string;
  betAmount: number;
  payoutAmount: number;
  profit: number;
}

/**
 * Emitted when there's an error
 */
export interface ErrorEvent {
  code: string;
  message: string;
}

/**
 * Current game state sent to newly connected clients
 */
export interface GameStateEvent {
  roundId: number;
  phase: GamePhase;
  phaseEndsAt: number;
  pools: PoolState[];
  totalPool: number;
  commitment?: string;
  positions?: number[];
  winner?: number;
}

// ===========================================
// Client -> Server Events
// ===========================================

/**
 * Client request to place a bet
 */
export interface PlaceBetPayload {
  spermId: number;
  /** Amount in lamports */
  amount: number;
  /** Solana transaction signature proving the deposit */
  txSignature: string;
}

/**
 * Response after placing a bet
 */
export interface PlaceBetResponse {
  success: boolean;
  betId?: string;
  error?: string;
}

// ===========================================
// Socket.io Type Definitions
// ===========================================

export interface ServerToClientEvents {
  'game:state': (data: GameStateEvent) => void;
  'phase:change': (data: PhaseChangeEvent) => void;
  'race:start': (data: RaceStartEvent) => void;
  'race:positions': (data: PositionsEvent) => void;
  'pool:updated': (data: PoolUpdatedEvent) => void;
  'distribution:results': (data: DistributionEvent) => void;
  error: (data: ErrorEvent) => void;
}

export interface ClientToServerEvents {
  'bet:place': (data: PlaceBetPayload, callback: (response: PlaceBetResponse) => void) => void;
}

export interface InterServerEvents {
  // For scaling with multiple server instances
  ping: () => void;
}

export interface SocketData {
  walletAddress?: string;
}
