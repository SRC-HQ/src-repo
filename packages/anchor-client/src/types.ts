import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

/**
 * Game state account data
 */
export interface GameStateAccount {
  authority: PublicKey;
  currentRound: BN;
  totalDeposited: BN;
  isPaused: boolean;
  houseFeePercent: number;
  bump: number;
}

/**
 * Bet record account data
 */
export interface BetRecordAccount {
  user: PublicKey;
  amount: BN;
  spermId: number;
  roundId: BN;
  claimed: boolean;
  payoutAmount: BN;
  bump: number;
}

/**
 * Parameters for depositing a bet
 */
export interface DepositBetParams {
  amount: BN;
  spermId: number;
  roundId: BN;
}

/**
 * PDA seeds and addresses
 */
export interface ProgramAddresses {
  gameState: PublicKey;
  gameStateBump: number;
  vault: PublicKey;
  vaultBump: number;
}
