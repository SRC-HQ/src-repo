#!/usr/bin/env bash
# Copies generated types and IDL from packages/contracts/target into packages/contract-types.
# Run from repo root after anchor build (e.g. via build:contracts).

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS_TARGET="$ROOT/packages/contracts/target"
CONTRACT_TYPES="$ROOT/packages/contract-types/src"

if [ ! -f "$CONTRACTS_TARGET/types/sperm_race.ts" ] || [ ! -f "$CONTRACTS_TARGET/idl/sperm_race.json" ]; then
  echo "Missing contracts build output. Run from repo root: bun run build:contracts"
  exit 1
fi

mkdir -p "$CONTRACT_TYPES/idl"
cp "$CONTRACTS_TARGET/types/sperm_race.ts" "$CONTRACT_TYPES/sperm_race.ts"
cp "$CONTRACTS_TARGET/idl/sperm_race.json" "$CONTRACT_TYPES/idl/sperm_race.json"
echo "Copied types and IDL to packages/contract-types/src"
echo "Commit packages/contract-types/src and push so VPS/CI can use them without building contracts."
