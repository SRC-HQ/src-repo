/**
 * Solana network config. Uses NEXT_PUBLIC_SOLANA_NETWORK.
 * RPC URLs are predefined per network (no RPC URL in env).
 */

export type SolanaNetworkEnv = 'mainnet-beta' | 'mainnet' | 'devnet' | 'testnet' | 'localnet';

/** RPC URLs per network - devnet uses Helius, localnet uses localhost, mainnet uses Solana default */
const RPC_URLS: Record<SolanaNetworkEnv, string> = {
  devnet: 'https://devnet.helius-rpc.com/?api-key=d3ef124a-4e48-471c-943a-5ff2c2a03b22',
  localnet: 'http://localhost:8899',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

export const SOLANA_NETWORK_ENV = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as SolanaNetworkEnv;

export function getRpcEndpoint(): string {
  return RPC_URLS[SOLANA_NETWORK_ENV] ?? RPC_URLS.devnet;
}

/** Solscan base URL for tx links (cluster param for devnet/testnet) */
export function getSolscanTxUrl(txHash: string): string {
  const base = 'https://solscan.io/tx';
  const cluster = SOLANA_NETWORK_ENV === 'mainnet' ? '' : `?cluster=${SOLANA_NETWORK_ENV}`;
  return `${base}/${txHash}${cluster}`;
}
