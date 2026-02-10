import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { COMMITMENT, SolanaNetwork, SOLANA_NETWORKS, DEFAULT_RPC_URLS } from '@/common';
import { ContractClientService } from './contract-client.service';

/** SlotHashes sysvar: stores recent (slot, hash) entries. */
const SLOT_HASHES_SYSVAR_ID = new PublicKey('SysvarS1otHashes111111111111111111111111111');

@Injectable()
export class SolanaService implements OnModuleInit {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private programId: PublicKey;
  private authorityWallet: Wallet | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly contractClient: ContractClientService,
  ) {}

  /**
   * Get default RPC URL for a network
   * Handles localnet which is not a valid Cluster type
   */
  private getDefaultRpcUrl(network: SolanaNetwork): string {
    return DEFAULT_RPC_URLS[network];
  }

  async onModuleInit() {
    const network = this.configService.get<SolanaNetwork>(
      'SOLANA_NETWORK',
      SOLANA_NETWORKS.DEVNET,
    );

    // Get RPC URL from env, with network-specific defaults
    const envRpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const rpcUrl = envRpcUrl || this.getDefaultRpcUrl(network);
    if (!envRpcUrl) {
      this.logger.log(`Using default RPC URL for ${network}: ${rpcUrl}`);
    } else {
      this.logger.log(`Using RPC URL from env: ${rpcUrl}`);
    }

    this.connection = new Connection(rpcUrl, COMMITMENT);

    // Get program ID from env - required, no hardcoded defaults
    const programIdStr = this.configService.get<string>('PROGRAM_ID');
    if (!programIdStr) {
      throw new Error(
        `PROGRAM_ID environment variable is required. Please set it in your .env file.`,
      );
    }
    this.programId = new PublicKey(programIdStr);

    // Load authority wallet
    await this.loadAuthorityWallet();

    this.logger.log(`✅ Solana service initialized on ${network}`);
    this.logger.log(`   RPC: ${rpcUrl}`);
    this.logger.log(`   Program ID: ${this.programId.toBase58()}`);
    if (this.authorityWallet) {
      this.logger.log(`   Authority: ${this.authorityWallet.publicKey.toBase58()}`);
    }
  }

  /**
   * Load authority wallet from environment variable
   */
  private async loadAuthorityWallet(): Promise<void> {
    try {
      // Get authority wallet from environment variable
      const authorityWalletEnv = this.configService.get<string>('AUTHORITY_WALLET');

      if (!authorityWalletEnv) {
        this.logger.warn(
          'AUTHORITY_WALLET environment variable not set. Some operations will be unavailable.',
        );
        throw new Error('No AUTHORITY_WALLET');
      }

      // Parse the wallet data (can be JSON array string or file path)
      let keypairData: number[];

      // Check if it's a JSON array string (like [36,235,...])
      if (authorityWalletEnv.trim().startsWith('[')) {
        keypairData = JSON.parse(authorityWalletEnv);
      } else {
        throw new Error('AUTHORITY_WALLET not set in ENV')
      }

      // Validate keypair data
      if (!Array.isArray(keypairData) || keypairData.length !== 64) {
        throw new Error('Invalid authority wallet format. Expected array of 64 numbers.');
      }

      const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

      this.authorityWallet = new Wallet(keypair);

      // Initialize contract client with authority wallet
      this.contractClient.initialize(this.connection, this.authorityWallet, this.programId);

      this.logger.log(
        `✅ Authority wallet loaded (Public Key: ${this.authorityWallet.publicKey.toBase58()})`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to load authority wallet: ${error.message}`);
      this.logger.warn('Continuing without authority wallet. Some operations will be unavailable.');
    }
  }

  /**
   * Get the Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get the contract client service
   */
  getContractClient(): ContractClientService {
    return this.contractClient;
  }

  /**
   * Get the authority wallet (if loaded)
   */
  getAuthorityWallet(): Wallet | null {
    return this.authorityWallet;
  }

  /**
   * Get treasury wallet public key from TREASURY_WALLET env (keypair array).
   * Required for initializing the game. Throws if TREASURY_WALLET is missing or invalid.
   */
  getTreasuryWalletPublicKey(): PublicKey {
    const treasuryWalletEnv = this.configService.get<string>('TREASURY_WALLET');
    if (!treasuryWalletEnv?.trim()) {
      throw new Error(
        'TREASURY_WALLET environment variable is required to initialize the game. Please set it in your .env file.',
      );
    }
    let keypairData: number[];
    if (treasuryWalletEnv.trim().startsWith('[')) {
      keypairData = JSON.parse(treasuryWalletEnv);
    } else {
      throw new Error(
        'TREASURY_WALLET must be a JSON array of 64 numbers (keypair). Please set it in your .env file.',
      );
    }
    if (!Array.isArray(keypairData) || keypairData.length !== 64) {
      throw new Error('Invalid TREASURY_WALLET format. Expected array of 64 numbers.');
    }
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    return keypair.publicKey;
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<number> {
    const balance = await this.connection.getBalance(new PublicKey(publicKey));
    return balance;
  }

  /**
   * Wait for transaction confirmation
   */
  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(signature, 'confirmed');
      return !result.value.err;
    } catch {
      return false;
    }
  }

  /**
   * Fetch slot hash for a given slot from SlotHashes sysvar.
   * Returns null if slot not in recent history (~512 slots).
   */
  async getSlotHashForSlot(slot: number): Promise<Buffer | null> {
    const accountInfo = await this.connection.getAccountInfo(SLOT_HASHES_SYSVAR_ID);
    if (!accountInfo?.data || accountInfo.data.length < 8) return null;
    const data = accountInfo.data as Buffer;
    const numEntries = data.readBigUInt64LE(0);
    let offset = 8;
    const entrySize = 8 + 32;
    for (let i = 0; i < numEntries && offset + entrySize <= data.length; i++) {
      const entrySlot = Number(data.readBigUInt64LE(offset));
      if (entrySlot === slot) {
        return Buffer.from(data.subarray(offset + 8, offset + 8 + 32));
      }
      offset += entrySize;
    }
    return null;
  }

  /**
   * Get current slot from the cluster (for setting end_slot when starting a round).
   */
  async getCurrentSlot(): Promise<number> {
    return this.connection.getSlot();
  }
}
