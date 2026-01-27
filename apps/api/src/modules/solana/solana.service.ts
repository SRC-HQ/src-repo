import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, Keypair, Cluster } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { COMMITMENT, SolanaNetwork, SOLANA_NETWORKS, DEFAULT_RPC_URLS } from '../../common';
import { ContractClientService } from './contract-client.service';
import * as fs from 'fs';

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
      SOLANA_NETWORKS.LOCALNET,
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
    this.logger.log(`Using program ID from env: ${programIdStr}`);
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
        // If it's a file path, read from file
        if (!fs.existsSync(authorityWalletEnv)) {
          this.logger.warn(`Authority wallet file not found at: ${authorityWalletEnv}`);
          return;
        }
        keypairData = JSON.parse(fs.readFileSync(authorityWalletEnv, 'utf-8'));
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
}
