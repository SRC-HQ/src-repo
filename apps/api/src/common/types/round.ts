/**
 * Decoded round from chain (indexer → round_history)
 */
export interface IndexedRoundStart {
  roundId: number;
  hashedSeed: string; // hex string (32 bytes = 64 chars)
  authority: string;
  txHash: string;
  slot: number;
  blockTime: number | null;
}

/**
 * Decoded round resolution from chain (indexer → round_history + distribution_history)
 */
export interface IndexedRoundResolution {
  roundId: number;
  winnerSpermId: number;
  totalPot: string; // lamports as string (bigint)
  totalAddress: number;
  isBabyKingHit: boolean;
  /** Baby King jackpot snapshot (0 if not hit). Used for distribution payout calculation. */
  babyKingJackpotSnapshot: string;
  txHash: string;
  slot: number;
  blockTime: number | null;
}
