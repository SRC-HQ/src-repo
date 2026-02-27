import { useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalanceStore } from '../store/walletBalanceStore';

/**
 * Shared wallet balance hook. Polls RPC every 10s.
 * Use refetch() after transactions (bet, claim) to update immediately.
 */
export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const balance = useWalletBalanceStore((s) => s.balance);
  const startPolling = useWalletBalanceStore((s) => s.startPolling);
  const stopPolling = useWalletBalanceStore((s) => s.stopPolling);
  const refetch = useWalletBalanceStore((s) => s.refetch);

  useEffect(() => {
    if (!publicKey || !connection) {
      stopPolling();
      return;
    }
    startPolling(connection, publicKey);
    return () => stopPolling();
  }, [publicKey, connection, startPolling, stopPolling]);

  const refetchBalance = useCallback(() => {
    if (publicKey && connection) {
      return refetch(connection, publicKey);
    }
  }, [publicKey, connection, refetch]);

  return { balance, refetch: refetchBalance };
}
