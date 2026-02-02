/**
 * Decoded bet from chain (indexer → bet_history)
 */
export interface IndexedBet {
  userAddress: string;
  roundId: number;
  spermId: number;
  amount: string; // lamports as string (bigint)
  txHash: string;
  slot: number;
  blockTime: number | null;
}
