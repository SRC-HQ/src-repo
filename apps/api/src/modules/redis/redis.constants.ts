/**
 * Redis key patterns for transient game state.
 *
 * Strategy:
 *   game:active                                → current round ID (string)
 *   game:round:{roundId}:phase                 → JSON { phase, endsAt, commitment?, winner? }
 *   game:round:{roundId}:totalPot              → lamports integer (INCRBY-safe)
 *   game:round:{roundId}:sperm:{id}:totalBets  → lamports integer (INCRBY-safe)
 *   game:round:{roundId}:sperm:{id}:bettors    → Set<walletAddress> (SADD/SCARD)
 *
 * All round-specific keys get a TTL after the round ends (see ROUND_KEY_TTL).
 */
export const REDIS_KEYS = {
  /** Current active round ID */
  ACTIVE_ROUND: 'game:active',

  /** Phase info for a round (JSON string) */
  roundPhase: (roundId: number) => `game:round:${roundId}:phase`,

  /** Total pot for a round in lamports */
  roundTotalPot: (roundId: number) => `game:round:${roundId}:totalPot`,

  /** Total bets on a specific sperm in lamports */
  spermTotalBets: (roundId: number, spermId: number) =>
    `game:round:${roundId}:sperm:${spermId}:totalBets`,

  /** Set of unique bettor wallet addresses per sperm */
  spermBettors: (roundId: number, spermId: number) =>
    `game:round:${roundId}:sperm:${spermId}:bettors`,
} as const;

/**
 * Redis Pub/Sub channel names.
 *
 * Convention: game:{domain}:{action}
 * All payloads are JSON strings with a `roundId` field for room routing.
 */
export const REDIS_CHANNELS = {
  /** New bet placed → pool state updated */
  POOL_UPDATE: 'game:pool:update',

  /** Game phase transition (preparation → resolution → distribution) */
  PHASE_UPDATE: 'game:phase:update',

  /** Round resolved — winner determined */
  ROUND_RESULT: 'game:round:result',
} as const;

/**
 * TTL (seconds) applied to round-specific Redis keys after the round ends.
 * Prevents memory bloat while allowing late-connecting clients a grace window.
 */
export const ROUND_KEY_TTL = 300; // 5 minutes
