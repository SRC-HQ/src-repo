#!/bin/bash

# Sperm Race - IDL Generation Script
# Builds the Anchor program and generates TypeScript types

set -e

echo "🔨 Building Anchor program..."
cd packages/contracts
anchor build

echo "📝 Generating TypeScript types from IDL..."
cd ../anchor-client
bun run generate

echo "✅ IDL types generated successfully!"
echo "   You can now use the updated types in your frontend and backend."
