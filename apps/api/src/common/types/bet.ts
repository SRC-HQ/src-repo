/**
 * Bet status enum
 */
export enum BetStatus {
  /** Bet is pending (waiting for on-chain confirmation) */
  PENDING = 'pending',
  /** Bet is confirmed on-chain */
  CONFIRMED = 'confirmed',
  /** Bet won, payout pending */
  WON = 'won',
  /** Bet lost */
  LOST = 'lost',
  /** Payout has been distributed */
  CLAIMED = 'claimed',
  /** Bet was rejected/failed */
  FAILED = 'failed',
}

/**
 * A single bet placed by a user
 */
export interface Bet {
  id: string;
  roundId: number;
  walletAddress: string;
  spermId: number;
  /** Amount in lamports */
  amount: number;
  /** Solana transaction signature for the deposit */
  depositTxSignature: string;
  status: BetStatus;
  /** Payout amount if bet won (lamports) */
  payoutAmount?: number;
  /** Payout transaction signature */
  payoutTxSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new bet
 */
export interface CreateBetDto {
  roundId: number;
  walletAddress: string;
  spermId: number;
  /** Amount in lamports */
  amount: number;
  /** Solana transaction signature for the deposit */
  txSignature: string;
}

/**
 * Summary of a user's bets in a round
 */
export interface UserRoundBets {
  roundId: number;
  walletAddress: string;
  bets: Bet[];
  totalBetAmount: number;
  totalPayout: number;
  netProfit: number;
}
