#!/bin/bash

# Sperm Race - Development Script
# Starts all services for local development

set -e

echo "🏊 Starting Sperm Race Development Environment..."
echo ""

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install it: https://classic.yarnpkg.com/lang/en/docs/install/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (yarn workspaces)..."
    yarn install
fi

# Build contracts and copy types/IDL to contract-types (when contracts changed)
echo "🔨 Building contracts and contract-types..."
yarn build:contracts 2>/dev/null || true

# Start development servers (turbo dev)
echo ""
echo "🚀 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""

yarn dev
