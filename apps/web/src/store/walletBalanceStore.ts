import { create } from 'zustand';
import type { Connection, PublicKey } from '@solana/web3.js';

let pollIntervalId: ReturnType<typeof setInterval> | null = null;
let pollPublicKey: string | null = null;

interface WalletBalanceStore {
  balance: number | null;
  setBalance: (balance: number | null) => void;
  startPolling: (connection: Connection, publicKey: PublicKey) => void;
  stopPolling: () => void;
  refetch: (connection: Connection, publicKey: PublicKey) => Promise<void>;
}

export const useWalletBalanceStore = create<WalletBalanceStore>((set) => ({
  balance: null,
  setBalance: (balance) => set({ balance }),

  startPolling: (connection, publicKey) => {
    const key = publicKey.toBase58();
    if (pollPublicKey === key && pollIntervalId) return;

    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }

    pollPublicKey = key;
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        set({ balance: bal });
      } catch (e) {
        console.error(e);
      }
    };
    fetchBalance();
    pollIntervalId = setInterval(fetchBalance, 10000);
  },

  stopPolling: () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    pollPublicKey = null;
    set({ balance: null });
  },

  refetch: async (connection, publicKey) => {
    try {
      const bal = await connection.getBalance(publicKey);
      set({ balance: bal });
    } catch (e) {
      console.error(e);
    }
  },
}));
