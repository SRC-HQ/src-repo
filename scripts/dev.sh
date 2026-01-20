#!/bin/bash

# Sperm Race - Development Script
# Starts all services for local development

set -e

echo "🏊 Starting Sperm Race Development Environment..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it: https://bun.sh"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Build shared packages first
echo "🔨 Building shared packages..."
bun run --filter @sperm-race/shared build

# Start development servers
echo ""
echo "🚀 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""

bun run dev
