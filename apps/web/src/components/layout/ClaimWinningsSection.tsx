'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameStore } from '../../store/gameStore';
import { useRaceContract } from '../../hooks/useRaceContract';
import SolColorIconSvg from '../svgs/SolColorIconSvg';
import { TxResultPopover } from '../ui/TxResultPopover';

const LAMPORTS_PER_SOL = 1e9;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UnclaimedRecord {
  id: string;
  round_id: string;
  winning_sperm_id: number;
  bet_amount: string;
  winning_amount: string;
  created_at: string;
}

export const ClaimWinningsSection = () => {
  const { publicKey, connected } = useWallet();
  const { batchClaimWinnings, loading } = useRaceContract();
  const apiPhase = useGameStore((state) => state.apiPhase);

  const [unclaimedRecords, setUnclaimedRecords] = useState<UnclaimedRecord[]>([]);
  const [totalWinningAmount, setTotalWinningAmount] = useState<string>('0');
  const [claimTxResult, setClaimTxResult] = useState<{ type: 'success'; txHash: string } | { type: 'error'; message: string } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchUnclaimedDistributions = useCallback(async () => {
    if (!publicKey || !API_BASE) {
      setUnclaimedRecords([]);
      setTotalWinningAmount('0');
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/distribution-history/unclaimed/${publicKey.toBase58()}`,
      );
      if (!res.ok) {
        setUnclaimedRecords([]);
        setTotalWinningAmount('0');
        return;
      }
      const data = await res.json();
      setUnclaimedRecords(data.records ?? []);
      setTotalWinningAmount(data.totalWinningAmount ?? '0');
    } catch {
      setUnclaimedRecords([]);
      setTotalWinningAmount('0');
    }
  }, [publicKey]);

  // Poll unclaimed distributions: every 1s during distribution phase, else every 3s
  useEffect(() => {
    if (!publicKey) {
      setUnclaimedRecords([]);
      setTotalWinningAmount('0');
      return;
    }
    const isDistribution = apiPhase === 'distribution';
    fetchUnclaimedDistributions();
    const interval = setInterval(fetchUnclaimedDistributions, isDistribution ? 1000 : 3000);
    return () => clearInterval(interval);
  }, [apiPhase, publicKey, fetchUnclaimedDistributions]);

  const handleClaimWinnings = useCallback(async () => {
    if (!connected || unclaimedRecords.length === 0 || loading || isClaiming) return;
    try {
      setClaimTxResult(null);
      setIsClaiming(true);
      const claims = unclaimedRecords.map((r) => ({
        roundId: Number(r.round_id),
        spermId: r.winning_sperm_id,
      }));
      const tx = await batchClaimWinnings(claims);
      setClaimTxResult({ type: 'success', txHash: tx });
      fetchUnclaimedDistributions();
    } catch (err: unknown) {
      setClaimTxResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Claim failed',
      });
    } finally {
      setIsClaiming(false);
    }
  }, [
    connected,
    unclaimedRecords,
    loading,
    isClaiming,
    batchClaimWinnings,
    fetchUnclaimedDistributions,
  ]);

  if (unclaimedRecords.length === 0) return null;

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 flex flex-col gap-3">
      <h3 className="font-sans text-sm tracking-wider text-yellow-400/90">Claim Winning</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">Total to claim</span>
        <div className="flex items-center gap-1.5">
          <SolColorIconSvg className="w-4 h-4" />
          <span className="font-bold text-white">
            {(Number(totalWinningAmount) / LAMPORTS_PER_SOL).toFixed(4)} SOL
          </span>
        </div>
      </div>
      <TxResultPopover
        result={claimTxResult}
        onDismiss={() => setClaimTxResult(null)}
        successLabel="Claim successful"
        errorLabel="Claim failed"
      />
      <button
        onClick={handleClaimWinnings}
        disabled={!connected || loading || isClaiming}
        className="w-full py-2.5 font-bold font-sans rounded-full bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isClaiming ? 'Claiming...' : `Claim ${unclaimedRecords.length} Winning${unclaimedRecords.length > 1 ? 's' : ''}`}
      </button>
    </div>
  );
};
