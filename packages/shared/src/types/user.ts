/**
 * User statistics
 */
export interface UserStats {
  walletAddress: string;
  /** Total number of bets placed */
  totalBetsCount: number;
  /** Total amount bet in lamports */
  totalBetsAmount: number;
  /** Total number of winning bets */
  totalWinsCount: number;
  /** Total winnings in lamports */
  totalWinnings: number;
  /** Net profit/loss in lamports */
  totalProfit: number;
  /** Win rate percentage (0-100) */
  winRate: number;
  /** Timestamp of first bet */
  firstBetAt?: Date;
  /** Timestamp of last bet */
  lastBetAt?: Date;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  /** Truncated wallet for display (e.g., "7xKX...3nPq") */
  displayAddress: string;
  totalProfit: number;
  totalWins: number;
  winRate: number;
}

/**
 * Leaderboard response
 */
export interface Leaderboard {
  entries: LeaderboardEntry[];
  /** Time range for the leaderboard */
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all_time';
  updatedAt: Date;
}
