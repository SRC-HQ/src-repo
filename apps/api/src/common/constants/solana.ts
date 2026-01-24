/**
 * Solana-related constants
 */

/** 1 SOL in lamports */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Minimum bet amount in lamports (0.01 SOL) */
export const MIN_BET_LAMPORTS = 10_000_000;

/** Maximum bet amount in lamports (10 SOL) */
export const MAX_BET_LAMPORTS = 10_000_000_000;

/** Transaction confirmation commitment level */
export const COMMITMENT = 'confirmed' as const;

/** Maximum number of bets per wallet per round */
export const MAX_BETS_PER_WALLET_PER_ROUND = 10;

/** Solana networks */
export const SOLANA_NETWORKS = {
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
} as const;

export type SolanaNetwork = (typeof SOLANA_NETWORKS)[keyof typeof SOLANA_NETWORKS];

/** Default RPC URLs */
export const DEFAULT_RPC_URLS: Record<SolanaNetwork, string> = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://localhost:8899',
};
