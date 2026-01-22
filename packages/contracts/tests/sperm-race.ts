/**
 * Sperm Race - Betting POC Tests
 * 
 * This test suite demonstrates the complete betting flow:
 * 1. Initialize the game
 * 2. Multiple users place bets on different sperms
 * 3. Authority sets the winner and calculates payouts
 * 4. Winners claim their winnings
 * 
 * Run with: anchor test
 */

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { expect } from 'chai';
import { SpermRace } from '../target/types/sperm_race';
import {
  getProgramAddresses,
  getBetRecordPda,
  airdrop,
  getBalance,
  formatSol,
  calculatePayout,
  logSection,
  logBet,
  logPayout,
  HOUSE_FEE_PERCENT,
} from './helpers';


describe('Sperm Race - Betting POC', () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SpermRace as Program<SpermRace>;
  const connection = provider.connection;

  // Test accounts
  const authority = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();
  const user3 = Keypair.generate();
  const user4 = Keypair.generate();

  // Program addresses
  let gameState: PublicKey;
  let vault: PublicKey;

  // Round configuration
  const roundId = new anchor.BN(1);
  const winningSperm = 3; // Sperm #3 wins!

  // Bet amounts (in lamports)
  const BET_AMOUNT_SMALL = 0.1 * LAMPORTS_PER_SOL;
  const BET_AMOUNT_MEDIUM = 0.5 * LAMPORTS_PER_SOL;
  const BET_AMOUNT_LARGE = 1 * LAMPORTS_PER_SOL;

  before(async () => {
    logSection('SETUP: Airdropping SOL to test accounts');

    // Get program addresses
    const addresses = getProgramAddresses(program.programId);
    gameState = addresses.gameState;
    vault = addresses.vault;

    console.log('  Program ID:', program.programId.toBase58());
    console.log('  Game State PDA:', gameState.toBase58());
    console.log('  Vault PDA:', vault.toBase58());
    console.log('');

    // Airdrop to all accounts
    await airdrop(connection, authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await airdrop(connection, user1.publicKey, 5 * LAMPORTS_PER_SOL);
    await airdrop(connection, user2.publicKey, 5 * LAMPORTS_PER_SOL);
    await airdrop(connection, user3.publicKey, 5 * LAMPORTS_PER_SOL);
    await airdrop(connection, user4.publicKey, 5 * LAMPORTS_PER_SOL);

    console.log('  ✅ Authority:', authority.publicKey.toBase58().slice(0, 8) + '...');
    console.log('  ✅ User 1:', user1.publicKey.toBase58().slice(0, 8) + '...');
    console.log('  ✅ User 2:', user2.publicKey.toBase58().slice(0, 8) + '...');
    console.log('  ✅ User 3:', user3.publicKey.toBase58().slice(0, 8) + '...');
    console.log('  ✅ User 4:', user4.publicKey.toBase58().slice(0, 8) + '...');
  });

  describe('Phase 1: Initialize Game', () => {
    it('should initialize the game state', async () => {
      logSection('PHASE 1: Initialize Game');

      await program.methods
        .initialize()
        .accounts({
          authority: authority.publicKey,
          gameState,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Verify game state
      const gameStateAccount = await program.account.gameState.fetch(gameState);
      
      expect(gameStateAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(gameStateAccount.currentRound.toNumber()).to.equal(0);
      expect(gameStateAccount.isPaused).to.equal(false);
      expect(gameStateAccount.houseFeePercent).to.equal(15);

      console.log('  ✅ Game initialized successfully!');
      console.log('  Authority:', gameStateAccount.authority.toBase58().slice(0, 8) + '...');
      console.log('  House Fee:', gameStateAccount.houseFeePercent + '%');
    });
  });

  describe('Phase 2: Place Bets (Preparation Phase)', () => {
    it('User 1 bets 0.5 SOL on Sperm #3 (winner)', async () => {
      logSection('PHASE 2: Place Bets');
      console.log('  Round ID:', roundId.toNumber());
      console.log('  Winning Sperm: #' + winningSperm + ' (known to us, not to users)');
      console.log('');

      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, winningSperm);

      await program.methods
        .depositBet(new anchor.BN(BET_AMOUNT_MEDIUM), winningSperm, roundId)
        .accounts({
          user: user1.publicKey,
          gameState,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      logBet('User 1', winningSperm, BET_AMOUNT_MEDIUM);
    });

    it('User 2 bets 0.1 SOL on Sperm #5 (loser)', async () => {
      const spermId = 5;
      const [betRecord] = getBetRecordPda(program.programId, user2.publicKey, roundId, spermId);

      await program.methods
        .depositBet(new anchor.BN(BET_AMOUNT_SMALL), spermId, roundId)
        .accounts({
          user: user2.publicKey,
          gameState,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      logBet('User 2', spermId, BET_AMOUNT_SMALL);
    });

    it('User 3 bets 1 SOL on Sperm #3 (winner)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user3.publicKey, roundId, winningSperm);

      await program.methods
        .depositBet(new anchor.BN(BET_AMOUNT_LARGE), winningSperm, roundId)
        .accounts({
          user: user3.publicKey,
          gameState,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user3])
        .rpc();

      logBet('User 3', winningSperm, BET_AMOUNT_LARGE);
    });

    it('User 4 bets 0.5 SOL on Sperm #7 (loser)', async () => {
      const spermId = 7;
      const [betRecord] = getBetRecordPda(program.programId, user4.publicKey, roundId, spermId);

      await program.methods
        .depositBet(new anchor.BN(BET_AMOUNT_MEDIUM), spermId, roundId)
        .accounts({
          user: user4.publicKey,
          gameState,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user4])
        .rpc();

      logBet('User 4', spermId, BET_AMOUNT_MEDIUM);
    });

    it('should have correct vault balance', async () => {
      const vaultBalance = await getBalance(connection, vault);
      const expectedTotal = BET_AMOUNT_SMALL + BET_AMOUNT_MEDIUM * 2 + BET_AMOUNT_LARGE;

      console.log('');
      console.log('  📊 Betting Summary:');
      console.log('  Total Pool:', formatSol(vaultBalance));
      console.log('  Expected:', formatSol(expectedTotal));

      expect(vaultBalance).to.be.closeTo(expectedTotal, 10000); // Allow small rent variance
    });

    it('should reject bets below minimum', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, 1);

      try {
        await program.methods
          .depositBet(new anchor.BN(0.001 * LAMPORTS_PER_SOL), 1, roundId) // Too small
          .accounts({
            user: user1.publicKey,
            gameState,
            betRecord,
            vault,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
        
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal('BetTooSmall');
        console.log('  ✅ Correctly rejected bet below minimum');
      }
    });
  });

  describe('Phase 3: Resolution (Set Payouts)', () => {
    let totalPool: number;
    let totalWinningBets: number;

    before(async () => {
      logSection('PHASE 3: Resolution - Calculate & Set Payouts');

      // Calculate totals
      totalPool = BET_AMOUNT_SMALL + BET_AMOUNT_MEDIUM * 2 + BET_AMOUNT_LARGE;
      totalWinningBets = BET_AMOUNT_MEDIUM + BET_AMOUNT_LARGE; // User1 + User3 on Sperm #3

      console.log('  🏁 Winner: Sperm #' + winningSperm);
      console.log('');
      console.log('  Pool Breakdown:');
      console.log('  Total Pool:', formatSol(totalPool));
      console.log('  House Fee (15%):', formatSol(Math.floor(totalPool * HOUSE_FEE_PERCENT / 100)));
      console.log('  Net Pool:', formatSol(totalPool - Math.floor(totalPool * HOUSE_FEE_PERCENT / 100)));
      console.log('  Total Winning Bets:', formatSol(totalWinningBets));
    });

    it('should set payout for User 1 (winner)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, winningSperm);
      
      const payout = calculatePayout(
        BET_AMOUNT_MEDIUM,
        totalWinningBets,
        totalPool,
        HOUSE_FEE_PERCENT
      );

      await program.methods
        .setPayout(new anchor.BN(payout))
        .accounts({
          authority: authority.publicKey,
          gameState,
          betRecord,
        })
        .signers([authority])
        .rpc();

      const betRecordAccount = await program.account.betRecord.fetch(betRecord);
      expect(betRecordAccount.payoutAmount.toNumber()).to.equal(payout);

      console.log('');
      console.log('  ✅ User 1 payout set:', formatSol(payout));
    });

    it('should set payout for User 2 (loser)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user2.publicKey, roundId, 5);

      await program.methods
        .setPayout(new anchor.BN(0)) // Loser gets 0
        .accounts({
          authority: authority.publicKey,
          gameState,
          betRecord,
        })
        .signers([authority])
        .rpc();

      console.log('  ✅ User 2 payout set: 0 SOL (lost)');
    });

    it('should set payout for User 3 (winner)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user3.publicKey, roundId, winningSperm);
      
      const payout = calculatePayout(
        BET_AMOUNT_LARGE,
        totalWinningBets,
        totalPool,
        HOUSE_FEE_PERCENT
      );

      await program.methods
        .setPayout(new anchor.BN(payout))
        .accounts({
          authority: authority.publicKey,
          gameState,
          betRecord,
        })
        .signers([authority])
        .rpc();

      console.log('  ✅ User 3 payout set:', formatSol(payout));
    });

    it('should set payout for User 4 (loser)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user4.publicKey, roundId, 7);

      await program.methods
        .setPayout(new anchor.BN(0))
        .accounts({
          authority: authority.publicKey,
          gameState,
          betRecord,
        })
        .signers([authority])
        .rpc();

      console.log('  ✅ User 4 payout set: 0 SOL (lost)');
    });

    it('should reject setPayout from non-authority', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, winningSperm);

      try {
        await program.methods
          .setPayout(new anchor.BN(999999))
          .accounts({
            authority: user1.publicKey, // Not the authority!
            gameState,
            betRecord,
          })
          .signers([user1])
          .rpc();

        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal('Unauthorized');
        console.log('  ✅ Correctly rejected setPayout from non-authority');
      }
    });
  });

  describe('Phase 4: Distribution (Claim Winnings)', () => {
    before(() => {
      logSection('PHASE 4: Distribution - Claim Winnings');
    });

    it('User 1 claims winnings', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, winningSperm);
      console.log("KNTL : ", betRecord)

      const balanceBefore = await getBalance(connection, user1.publicKey);
      const betRecordBefore = await program.account.betRecord.fetch(betRecord);

      await program.methods
        .claimWinnings()
        .accounts({
          user: user1.publicKey,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      const balanceAfter = await getBalance(connection, user1.publicKey);
      const betRecordAfter = await program.account.betRecord.fetch(betRecord);

      expect(betRecordAfter.claimed).to.equal(true);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);

      logPayout('User 1', BET_AMOUNT_MEDIUM, betRecordBefore.payoutAmount.toNumber());
    });

    it('User 2 cannot claim (loser)', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user2.publicKey, roundId, 5);

      try {
        await program.methods
          .claimWinnings()
          .accounts({
            user: user2.publicKey,
            betRecord,
            vault,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal('NotAWinner');
        logPayout('User 2', BET_AMOUNT_SMALL, 0);
      }
    });

    it('User 3 claims winnings', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user3.publicKey, roundId, winningSperm);
      
      const betRecordBefore = await program.account.betRecord.fetch(betRecord);

      await program.methods
        .claimWinnings()
        .accounts({
          user: user3.publicKey,
          betRecord,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([user3])
        .rpc();

      const betRecordAfter = await program.account.betRecord.fetch(betRecord);
      expect(betRecordAfter.claimed).to.equal(true);

      logPayout('User 3', BET_AMOUNT_LARGE, betRecordBefore.payoutAmount.toNumber());
    });

    it('User 1 cannot claim twice', async () => {
      const [betRecord] = getBetRecordPda(program.programId, user1.publicKey, roundId, winningSperm);

      try {
        await program.methods
          .claimWinnings()
          .accounts({
            user: user1.publicKey,
            betRecord,
            vault,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.error.errorCode.code).to.equal('AlreadyClaimed');
        console.log('  ✅ Correctly rejected double claim');
      }
    });
  });

  describe('Phase 5: House Fee Withdrawal', () => {
    it('Authority withdraws house fees', async () => {
      logSection('PHASE 5: House Fee Withdrawal');

      const vaultBalance = await getBalance(connection, vault);
      const authorityBalanceBefore = await getBalance(connection, authority.publicKey);

      console.log('  Vault remaining balance:', formatSol(vaultBalance));

      if (vaultBalance > 0) {
        await program.methods
          .withdrawFees(new anchor.BN(vaultBalance))
          .accounts({
            authority: authority.publicKey,
            gameState,
            vault,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        const authorityBalanceAfter = await getBalance(connection, authority.publicKey);
        console.log('  ✅ Authority withdrew:', formatSol(authorityBalanceAfter - authorityBalanceBefore));
      }
    });
  });

  describe('Final Summary', () => {
    it('prints final balances', async () => {
      logSection('FINAL SUMMARY');

      const balances = await Promise.all([
        getBalance(connection, authority.publicKey),
        getBalance(connection, user1.publicKey),
        getBalance(connection, user2.publicKey),
        getBalance(connection, user3.publicKey),
        getBalance(connection, user4.publicKey),
        getBalance(connection, vault),
      ]);

      console.log('  Final Balances:');
      console.log('  Authority:', formatSol(balances[0]));
      console.log('  User 1 (won):', formatSol(balances[1]));
      console.log('  User 2 (lost):', formatSol(balances[2]));
      console.log('  User 3 (won):', formatSol(balances[3]));
      console.log('  User 4 (lost):', formatSol(balances[4]));
      console.log('  Vault:', formatSol(balances[5]));
      console.log('');
      console.log('  ✅ POC Complete! The betting contract works as expected.');
    });
  });
});
