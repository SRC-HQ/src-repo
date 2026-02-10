'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import { SOLANA_NETWORK_ENV, getRpcEndpoint } from '../constants/network';
import '@solana/wallet-adapter-react-ui/styles.css';

const NETWORK_TO_ADAPTER: Record<string, WalletAdapterNetwork> = {
  localnet: WalletAdapterNetwork.Devnet,
  devnet: WalletAdapterNetwork.Devnet,
  mainnet: WalletAdapterNetwork.Mainnet,
};

export function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const network = NETWORK_TO_ADAPTER[SOLANA_NETWORK_ENV] ?? WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => getRpcEndpoint(), []);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
