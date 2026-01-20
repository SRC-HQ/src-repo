/**
 * Game phase enum representing the three phases of each round
 */
export enum GamePhase {
  /** Players can place bets during this phase */
  PREPARATION = 'preparation',
  /** Race animation plays, winner is revealed */
  RESOLUTION = 'resolution',
  /** Winnings are distributed, results shown */
  DISTRIBUTION = 'distribution',
}

/**
 * Current state of a single sperm in the race
 */
export interface SpermState {
  id: number;
  /** Position progress from 0 (start) to 100 (finish) */
  position: number;
  /** Whether this sperm has crossed the finish line */
  finished: boolean;
}

/**
 * Betting pool state for a single sperm
 */
export interface PoolState {
  spermId: number;
  /** Total amount bet on this sperm in lamports */
  totalBets: number;
  /** Number of unique bettors */
  bettorCount: number;
  /** Current odds (potential payout multiplier) */
  odds: number;
}

/**
 * Complete state of a game round
 */
export interface RoundState {
  /** Unique round identifier */
  roundId: number;
  /** Current phase of the round */
  phase: GamePhase;
  /** Unix timestamp (ms) when current phase ends */
  phaseEndsAt: number;
  /** Betting pools for each sperm */
  pools: PoolState[];
  /** Total amount in the pool across all sperms (lamports) */
  totalPool: number;
  /** RNG commitment hash (shown during preparation) */
  commitment?: string;
  /** RNG seed (revealed after preparation) */
  seed?: string;
  /** Winner sperm ID (set after resolution) */
  winner?: number;
  /** Sperm positions during race */
  positions?: number[];
}

/**
 * Result of a completed round
 */
export interface RoundResult {
  roundId: number;
  winnerSpermId: number;
  totalPool: number;
  houseFee: number;
  netPool: number;
  /** Final positions of all sperms (index = rank, value = spermId) */
  finalRanking: number[];
  seed: string;
  commitment: string;
}
