/**
 * Test Helper Utilities
 */

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { SpermRace } from '../target/types/sperm_race';

// Constants
export const SPERM_COUNT = 10;
export const HOUSE_FEE_PERCENT = 15;
export const MIN_BET = 0.01 * LAMPORTS_PER_SOL;
export const MAX_BET = 10 * LAMPORTS_PER_SOL;

/**
 * Get PDA addresses for the program
 */
export function getProgramAddresses(programId: PublicKey) {
  const [gameState, gameStateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    programId
  );

  const [vault, vaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    programId
  );

  return { gameState, gameStateBump, vault, vaultBump };
}

/**
 * Get bet record PDA
 */
export function getBetRecordPda(
  programId: PublicKey,
  user: PublicKey,
  roundId: anchor.BN,
  spermId: number
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('bet'),
      user.toBuffer(),
      roundId.toArrayLike(Buffer, 'le', 8),
      Buffer.from([spermId]),
    ],
    programId
  );
}

/**
 * Airdrop SOL to a keypair
 */
export async function airdrop(
  connection: Connection,
  to: PublicKey,
  amount: number = 10 * LAMPORTS_PER_SOL
): Promise<void> {
  const signature = await connection.requestAirdrop(to, amount);
  await connection.confirmTransaction(signature, 'confirmed');
}

/**
 * Get account balance
 */
export async function getBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  return connection.getBalance(pubkey);
}

/**
 * Format lamports as SOL string
 */
export function formatSol(lamports: number): string {
  return `${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
}

/**
 * Calculate expected payout
 */
export function calculatePayout(
  userBet: number,
  totalWinningBets: number,
  totalPool: number,
  houseFeePercent: number
): number {
  const houseFee = Math.floor((totalPool * houseFeePercent) / 100);
  const netPool = totalPool - houseFee;
  return Math.floor((userBet / totalWinningBets) * netPool);
}

/**
 * Log a section divider
 */
export function logSection(title: string): void {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Log bet details
 */
export function logBet(
  userName: string,
  spermId: number,
  amount: number
): void {
  console.log(`  💰 ${userName} bet ${formatSol(amount)} on Sperm #${spermId}`);
}

/**
 * Log payout details
 */
export function logPayout(
  userName: string,
  bet: number,
  payout: number
): void {
  const profit = payout - bet;
  const emoji = profit > 0 ? '🎉' : '😢';
  console.log(`  ${emoji} ${userName}: Bet ${formatSol(bet)} → Payout ${formatSol(payout)} (${profit > 0 ? '+' : ''}${formatSol(profit)})`);
}
