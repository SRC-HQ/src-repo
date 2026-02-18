import { GamePhase } from './game';

// ─── Socket Payload Types (lean, scannable objects) ──────────────────
// Designed to be minimal: no user-sperm bet maps, no bulky arrays.
// Frontend derives what it needs from these compact payloads.

/** Per-sperm pool snapshot — part of the initial game state */
export interface SpermPoolState {
  spermId: number;
  /** Total bets on this sperm (lamports string) */
  totalBets: string;
  /** Number of unique bettor wallet addresses */
  bettorCount: number;
}

/**
 * Full game state snapshot — sent once when a client connects.
 * Contains everything the frontend needs to render the current round.
 */
export interface GameStatePayload {
  roundId: number;
  phase: GamePhase;
  /** Unix timestamp (ms) when current phase started (server clock) */
  phaseStartedAt: number;
  /** Unix timestamp (ms) when current phase ends (server clock) */
  phaseEndsAt: number;
  /** Total pot for the round (lamports string) */
  totalPot: string;
  /** Pool state for each sperm (one entry per sperm) */
  sperms: SpermPoolState[];
  /** Hashed seed commitment (present during preparation phase) */
  commitment?: string;
  /** Winning sperm ID (present after resolution) */
  winner?: number;
}

/**
 * Pool update — emitted each time a new bet is indexed.
 * Incrementally updates the frontend's pool state for a single sperm.
 */
export interface PoolUpdatePayload {
  roundId: number;
  spermId: number;
  /** Updated total bets on this sperm (lamports string) */
  totalBets: string;
  /** Updated unique bettor count for this sperm */
  bettorCount: number;
  /** Updated round total pot (lamports string) */
  totalPot: string;
}

/**
 * Phase transition — emitted when the game moves between phases.
 * Frontend uses `endsAt` to render a countdown timer.
 */
export interface PhaseUpdatePayload {
  roundId: number;
  phase: GamePhase;
  /** Unix timestamp (ms) when this phase started (server clock) */
  startedAt: number;
  /** Unix timestamp (ms) when this phase ends (server clock) */
  endsAt: number;
  /** Hashed seed (preparation phase only) */
  commitment?: string;
  /** Winner sperm ID (resolution/distribution phases) */
  winner?: number;
  /** Total pot snapshot (distribution phase) */
  totalPot?: string;
}

/**
 * Round result — emitted when the on-chain resolve confirms a winner.
 * Triggers the race animation / winner reveal on the frontend.
 */
export interface RoundResultPayload {
  roundId: number;
  winnerId: number;
  totalPot: string;
  isBabyKingHit: boolean;
}

/** Error payload */
export interface ErrorPayload {
  code: string;
  message: string;
}

export interface ServerToClientEvents {
  /** Initial game state snapshot (sent on connect) */
  'game:state': (data: GameStatePayload) => void;
  /** Pool update after a new bet is indexed */
  'pool:update': (data: PoolUpdatePayload) => void;
  /** Phase transition (preparation → resolution → distribution) */
  'phase:update': (data: PhaseUpdatePayload) => void;
  /** Round resolved — winner determined */
  'round:result': (data: RoundResultPayload) => void;
  /** Error event */
  error: (data: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  // Bets are placed on-chain via Solana transactions.
  // The indexer catches them and routes through Redis Pub/Sub —
  // no client→server bet events needed over the socket.
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  walletAddress?: string;
}
