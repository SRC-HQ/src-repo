'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameStore } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';
import {
  GamePhase,
  SPERM_COLORS,
  SPERM_NAMES,
  LAMPORTS_PER_SOL,
  MIN_BET_LAMPORTS,
  MAX_BET_LAMPORTS,
} from '@sperm-race/shared';

export function BettingPanel() {
  const { connected, publicKey } = useWallet();
  const { placeBet } = useSocket();

  const phase = useGameStore((state) => state.phase);
  const pools = useGameStore((state) => state.pools);
  const selectedSperm = useGameStore((state) => state.selectedSperm);
  const betAmount = useGameStore((state) => state.betAmount);
  const setSelectedSperm = useGameStore((state) => state.setSelectedSperm);
  const setBetAmount = useGameStore((state) => state.setBetAmount);
  const addUserBet = useGameStore((state) => state.addUserBet);

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canBet = phase === GamePhase.PREPARATION && connected;

  const handlePlaceBet = async () => {
    if (!canBet || selectedSperm === null || !betAmount || !publicKey) return;

    const amountLamports = Math.floor(parseFloat(betAmount) * LAMPORTS_PER_SOL);

    if (amountLamports < MIN_BET_LAMPORTS) {
      setError(`Minimum bet is ${MIN_BET_LAMPORTS / LAMPORTS_PER_SOL} SOL`);
      return;
    }

    if (amountLamports > MAX_BET_LAMPORTS) {
      setError(`Maximum bet is ${MAX_BET_LAMPORTS / LAMPORTS_PER_SOL} SOL`);
      return;
    }

    setIsPlacing(true);
    setError(null);

    try {
      // TODO: Build and send actual Solana transaction
      // For now, we'll simulate with a dummy signature
      const dummySignature = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await placeBet({
        spermId: selectedSperm,
        amount: amountLamports,
        txSignature: dummySignature,
      });

      // Add to user bets
      addUserBet({ spermId: selectedSperm, amount: amountLamports });

      // Reset form
      setSelectedSperm(null);
      setBetAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-4 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🎰</span> Place Your Bet
      </h2>

      {/* Wallet Not Connected */}
      {!connected && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to place bets</p>
        </div>
      )}

      {/* Betting Disabled */}
      {connected && phase !== GamePhase.PREPARATION && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {phase === GamePhase.RESOLUTION
              ? '🏁 Race in progress...'
              : '💰 Distributing winnings...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Betting opens in next round
          </p>
        </div>
      )}

      {/* Betting Form */}
      {canBet && (
        <>
          {/* Sperm Selection */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
            {pools.map((pool, i) => (
              <SpermCard
                key={i}
                spermId={i}
                pool={pool}
                isSelected={selectedSperm === i}
                onSelect={() => setSelectedSperm(i)}
              />
            ))}
          </div>

          {/* Bet Amount Input */}
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">
              Bet Amount (SOL)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.1"
                min="0.01"
                max="10"
                step="0.01"
                className="flex-1 bg-game-bg border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-game-accent"
              />
              <div className="flex gap-1">
                {[0.1, 0.5, 1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    className="px-3 py-2 bg-game-card hover:bg-game-accent/20 rounded-lg text-sm transition-colors"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-game-error/20 border border-game-error/50 rounded-lg text-game-error text-sm">
              {error}
            </div>
          )}

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!selectedSperm || !betAmount || isPlacing}
            className={`
              w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all
              ${
                selectedSperm !== null && betAmount
                  ? 'bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 cursor-pointer'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isPlacing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Placing Bet...
              </span>
            ) : selectedSperm !== null ? (
              `Bet on ${SPERM_NAMES[selectedSperm]} 🚀`
            ) : (
              'Select a Sperm'
            )}
          </button>
        </>
      )}
    </div>
  );
}

interface SpermCardProps {
  spermId: number;
  pool: {
    totalBets: number;
    bettorCount: number;
    odds: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function SpermCard({ spermId, pool, isSelected, onSelect }: SpermCardProps) {
  const color = SPERM_COLORS[spermId];
  const name = SPERM_NAMES[spermId];

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-3 rounded-xl border-2 transition-all text-left
        ${
          isSelected
            ? 'border-game-accent bg-game-accent/10'
            : 'border-transparent bg-game-card hover:border-white/20'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Color indicator */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: color }}
          >
            {spermId + 1}
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-gray-400">
              {pool.bettorCount} bettor{pool.bettorCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">
            {(pool.totalBets / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </p>
          <p
            className={`text-lg font-bold ${
              pool.odds > 2 ? 'text-game-success' : 'text-white'
            }`}
          >
            {pool.odds > 0 ? `${pool.odds.toFixed(1)}x` : '-'}
          </p>
        </div>
      </div>
    </button>
  );
}
