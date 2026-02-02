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
