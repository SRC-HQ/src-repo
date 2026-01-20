/**
 * Script to generate TypeScript types from Anchor IDL
 * 
 * Run this after `anchor build` to update the IDL types
 * 
 * Usage: bun run scripts/generate-idl.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const IDL_SOURCE = path.join(__dirname, '../../contracts/target/idl/sperm_race.json');
const IDL_DEST = path.join(__dirname, '../src/idl.ts');

async function main() {
  console.log('Generating IDL types...');

  // Check if source IDL exists
  if (!fs.existsSync(IDL_SOURCE)) {
    console.error(`IDL not found at ${IDL_SOURCE}`);
    console.error('Please run `anchor build` in packages/contracts first.');
    process.exit(1);
  }

  // Read the IDL
  const idlJson = JSON.parse(fs.readFileSync(IDL_SOURCE, 'utf-8'));

  // Generate TypeScript
  const tsContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from Anchor IDL
 * Run \`bun run generate:idl\` to regenerate
 */

export type SpermRace = ${JSON.stringify(idlJson, null, 2)};

export const IDL: SpermRace = ${JSON.stringify(idlJson, null, 2)};
`;

  // Write the file
  fs.writeFileSync(IDL_DEST, tsContent);
  console.log(`IDL types written to ${IDL_DEST}`);
}

main().catch(console.error);
