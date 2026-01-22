/**
 * Sperm Race - Betting POC Script
 * 
 * A standalone script that demonstrates the full betting flow on devnet.
 * This is useful for manual testing without running the full test suite.
 * 
 * Usage: bun run scripts/poc-betting.ts
 * 
 * Prerequisites:
 * 1. Run `bun run generate-keys` to create keypairs
 * 2. Run `bun run fund-devnet` to fund wallets
 * 3. Deploy the contract: `anchor deploy --provider.cluster devnet`
 */

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  SystemProgram,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CLUSTER = 'localnet';
const PROGRAM_ID = new PublicKey('EPLZGLkPntoQswDdtDdgZ3kK1jrQBJC66dgadtyeDEry');
const KEYS_DIR = path.join(__dirname, '../keys');

// Load IDL
const IDL = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../target/idl/sperm_race.json'), 'utf-8')
);

// Helper to load keypair
function loadKeypair(name: string): Keypair {
  const filepath = path.join(KEYS_DIR, `${name}.json`);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Keypair not found: ${filepath}. Run 'bun run generate-keys' first.`);
  }
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(filepath, 'utf-8')))
  );
}

// Get PDAs
function getProgramAddresses(programId: PublicKey) {
  const [gameState] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    programId
  );
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    programId
  );
  return { gameState, vault };
}

function getBetRecordPda(
  programId: PublicKey,
  user: PublicKey,
  roundId: anchor.BN,
  spermId: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('bet'),
      user.toBuffer(),
      roundId.toArrayLike(Buffer, 'le', 8),
      Buffer.from([spermId]),
    ],
    programId
  );
  return pda;
}

function formatSol(lamports: number): string {
  return `${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
}

async function main() {
  console.log('\n🏊 Sperm Race - Betting POC on Devnet\n');
  console.log('='.repeat(60));

  // Connect to devnet
  const connection = new Connection(clusterApiUrl(CLUSTER), 'confirmed');
  console.log(`\n🌐 Connected to ${CLUSTER}`);

  // Load keypairs
  console.log('\n📁 Loading keypairs...');
  const authority = loadKeypair('authority');
  const user1 = loadKeypair('user1');
  const user2 = loadKeypair('user2');

  console.log(`   Authority: ${authority.publicKey.toBase58()}`);
  console.log(`   User 1: ${user1.publicKey.toBase58()}`);
  console.log(`   User 2: ${user2.publicKey.toBase58()}`);

  // Check balances
  console.log('\n💰 Checking balances...');
  const authorityBalance = await connection.getBalance(authority.publicKey);
  const user1Balance = await connection.getBalance(user1.publicKey);
  const user2Balance = await connection.getBalance(user2.publicKey);

  console.log(`   Authority: ${formatSol(authorityBalance)}`);
  console.log(`   User 1: ${formatSol(user1Balance)}`);
  console.log(`   User 2: ${formatSol(user2Balance)}`);

  if (authorityBalance < 0.1 * LAMPORTS_PER_SOL) {
    console.log('\n⚠️  Authority wallet needs funding. Run `bun run fund-devnet`');
    return;
  }

  // Create provider and program
  const wallet = new anchor.Wallet(authority);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  anchor.setProvider(provider);

  const program = new Program(IDL, PROGRAM_ID, provider);
  const { gameState, vault } = getProgramAddresses(PROGRAM_ID);

  console.log('\n📋 Program addresses:');
  console.log(`   Game State: ${gameState.toBase58()}`);
  console.log(`   Vault: ${vault.toBase58()}`);

  // Check if game is already initialized
  let gameStateAccount = await connection.getAccountInfo(gameState);

  if (!gameStateAccount) {
    console.log('\n🎮 Initializing game...');
    
    try {
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
      
      console.log('   ✅ Game initialized!');
    } catch (error: any) {
      console.log(`   ❌ Failed to initialize: ${error.message}`);
      return;
    }
  } else {
    console.log('\n🎮 Game already initialized');
  }

  // Place a bet from user1
  const roundId = new anchor.BN(Date.now()); // Use timestamp as unique round ID
  const spermId = 3;
  const betAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

  console.log(`\n💰 Placing bet from User 1...`);
  console.log(`   Round: ${roundId.toString()}`);
  console.log(`   Sperm: #${spermId}`);
  console.log(`   Amount: ${formatSol(betAmount.toNumber())}`);

  const betRecord = getBetRecordPda(PROGRAM_ID, user1.publicKey, roundId, spermId);

  try {
    // Create a new provider with user1's wallet
    const user1Wallet = new anchor.Wallet(user1);
    const user1Provider = new anchor.AnchorProvider(connection, user1Wallet, {
      commitment: 'confirmed',
    });
    const user1Program = new Program(IDL, PROGRAM_ID, user1Provider);

    await user1Program.methods
      .depositBet(betAmount, spermId, roundId)
      .accounts({
        user: user1.publicKey,
        gameState,
        betRecord,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    console.log('   ✅ Bet placed successfully!');

    // Check vault balance
    const vaultBalance = await connection.getBalance(vault);
    console.log(`\n🏦 Vault balance: ${formatSol(vaultBalance)}`);

  } catch (error: any) {
    console.log(`   ❌ Failed to place bet: ${error.message}`);
    if (error.logs) {
      console.log('\n   Logs:');
      error.logs.forEach((log: string) => console.log(`   ${log}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ POC Complete!\n');
}

main().catch(console.error);
