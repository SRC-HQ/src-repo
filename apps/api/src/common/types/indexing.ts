/**
 * Raw payload from indexer to instruction-specific modules.
 * Indexer only detects instruction name; each module parses logs as needed.
 */
export interface RawInstructionPayload {
  /** Instruction name as in logs, e.g. 'PlaceBet' */
  instruction: string;
  /** Full program logs for this tx */
  logs: string[];
  signature: string;
  slot: number;
  blockTime: number | null;
}

/** Job data for the indexing queue (includes instruction names for routing) */
export interface IndexingJobData extends RawInstructionPayload {
  instructionNames: string[];
}
  