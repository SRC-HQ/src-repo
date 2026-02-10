/**
 * Solana network / cluster. Used to select RPC and wallet adapter network.
 */
export type SolanaNetworkEnv = 'localnet' | 'devnet' | 'mainnet';

export const SOLANA_NETWORK_ENV = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as SolanaNetworkEnv;

const DEFAULT_RPC: Record<SolanaNetworkEnv, string> = {
  localnet: 'http://127.0.0.1:8899',
  devnet: 'https://devnet.helius-rpc.com/?api-key=d3ef124a-4e48-471c-943a-5ff2c2a03b22',
  // devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

export function getRpcEndpoint(): string {
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL.trim();
  }
  return DEFAULT_RPC[SOLANA_NETWORK_ENV] ?? DEFAULT_RPC.devnet;
}
