/**
 * Sperm Race - Keypair Generation Script
 * 
 * Generates Solana keypairs for development and testing:
 * - authority.json: Game authority (admin) wallet
 * - user1.json - user5.json: Test user wallets
 * 
 * Usage: bun run generate-keys
 */

import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const KEYS_DIR = path.join(__dirname, '../keys');

interface KeypairInfo {
  name: string;
  description: string;
}

const KEYPAIRS_TO_GENERATE: KeypairInfo[] = [
  { name: 'authority', description: 'Game authority (admin) wallet' },
  { name: 'user1', description: 'Test user 1' },
  { name: 'user2', description: 'Test user 2' },
  { name: 'user3', description: 'Test user 3' },
  { name: 'user4', description: 'Test user 4' },
  { name: 'user5', description: 'Test user 5' },
];

function ensureKeysDir() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
    console.log(`📁 Created keys directory: ${KEYS_DIR}`);
  }
}

function generateKeypair(name: string, description: string): void {
  const filepath = path.join(KEYS_DIR, `${name}.json`);

  // Check if keypair already exists
  if (fs.existsSync(filepath)) {
    const existingKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(filepath, 'utf-8')))
    );
    console.log(`⏭️  ${name}.json already exists: ${existingKeypair.publicKey.toBase58()}`);
    return;
  }

  // Generate new keypair
  const keypair = Keypair.generate();
  
  // Save as JSON array (Solana CLI format)
  fs.writeFileSync(filepath, JSON.stringify(Array.from(keypair.secretKey)));

  console.log(`✅ Generated ${name}.json`);
  console.log(`   Public Key: ${keypair.publicKey.toBase58()}`);
  console.log(`   Description: ${description}`);
  console.log('');
}

function generateEnvFile(): void {
  const envPath = path.join(KEYS_DIR, 'env.local');
  
  let envContent = '# Auto-generated Solana keypair public keys\n';
  envContent += '# Copy these to your .env file as needed\n\n';

  for (const { name } of KEYPAIRS_TO_GENERATE) {
    const filepath = path.join(KEYS_DIR, `${name}.json`);
    if (fs.existsSync(filepath)) {
      const keypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(filepath, 'utf-8')))
      );
      const varName = name.toUpperCase().replace(/-/g, '_');
      envContent += `${varName}_PUBKEY=${keypair.publicKey.toBase58()}\n`;
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Generated ${envPath}`);
}

function main() {
  console.log('🔑 Sperm Race - Keypair Generator\n');
  console.log('='.repeat(50));
  console.log('');

  ensureKeysDir();

  for (const { name, description } of KEYPAIRS_TO_GENERATE) {
    generateKeypair(name, description);
  }

  console.log('='.repeat(50));
  generateEnvFile();

  console.log('\n✨ Done! Keypairs are stored in packages/contracts/keys/');
  console.log('');
  console.log('⚠️  IMPORTANT: These keys are for development only!');
  console.log('   Never use these keys on mainnet or with real funds.');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Fund the authority wallet on devnet:');
  console.log('      solana airdrop 2 <AUTHORITY_PUBKEY> --url devnet');
  console.log('   2. Fund test user wallets:');
  console.log('      solana airdrop 2 <USER_PUBKEY> --url devnet');
  console.log('   3. Run the tests:');
  console.log('      cd packages/contracts && anchor test');
}

main();
