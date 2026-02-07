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
