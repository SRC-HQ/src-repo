/**
 * Sperm Race - Devnet Funding Script
 * 
 * Airdrops SOL to all generated keypairs on devnet
 * 
 * Usage: bun run fund-devnet
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const KEYS_DIR = path.join(__dirname, '../keys');
const AIRDROP_AMOUNT = 2 * LAMPORTS_PER_SOL; // 2 SOL per wallet

async function loadKeypair(name: string): Promise<Keypair | null> {
  const filepath = path.join(KEYS_DIR, `${name}.json`);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(filepath, 'utf-8')))
  );
}

async function airdrop(connection: Connection, keypair: Keypair, name: string): Promise<void> {
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`\n📍 ${name}: ${keypair.publicKey.toBase58()}`);
  console.log(`   Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance >= AIRDROP_AMOUNT) {
    console.log(`   ⏭️  Already has sufficient balance, skipping airdrop`);
    return;
  }

  try {
    console.log(`   💸 Requesting airdrop of ${AIRDROP_AMOUNT / LAMPORTS_PER_SOL} SOL...`);
    const signature = await connection.requestAirdrop(keypair.publicKey, AIRDROP_AMOUNT);
    
    console.log(`   ⏳ Waiting for confirmation...`);
    await connection.confirmTransaction(signature, 'confirmed');
    
    const newBalance = await connection.getBalance(keypair.publicKey);
    console.log(`   ✅ New balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
  } catch (error: any) {
    console.log(`   ❌ Airdrop failed: ${error.message}`);
    console.log(`   💡 You may have hit the rate limit. Try again later or use:`);
    console.log(`      solana airdrop 2 ${keypair.publicKey.toBase58()} --url devnet`);
  }
}

async function main() {
  console.log('💰 Sperm Race - Devnet Funding Script\n');
  console.log('='.repeat(50));

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('🌐 Connected to Solana Devnet');

  // Load and fund keypairs
  const keypairNames = ['authority', 'user1', 'user2', 'user3', 'user4', 'user5'];

  for (const name of keypairNames) {
    const keypair = await loadKeypair(name);
    if (keypair) {
      await airdrop(connection, keypair, name);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`\n⚠️  ${name}.json not found. Run 'bun run generate-keys' first.`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Done!');
}

main().catch(console.error);
