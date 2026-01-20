import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { COMMITMENT, SolanaNetwork, SOLANA_NETWORKS } from '@sperm-race/shared';

@Injectable()
export class SolanaService implements OnModuleInit {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private programId: PublicKey;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<SolanaNetwork>(
      'SOLANA_NETWORK',
      SOLANA_NETWORKS.DEVNET,
    );
    const rpcUrl = this.configService.get<string>(
      'SOLANA_RPC_URL',
      clusterApiUrl(network),
    );

    this.connection = new Connection(rpcUrl, COMMITMENT);

    const programIdStr = this.configService.get<string>(
      'PROGRAM_ID',
      'SpermRace111111111111111111111111111111111',
    );
    this.programId = new PublicKey(programIdStr);

    this.logger.log(`Solana service initialized on ${network}`);
    this.logger.log(`RPC: ${rpcUrl}`);
    this.logger.log(`Program ID: ${this.programId.toBase58()}`);
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
   * Verify a bet transaction on-chain
   */
  async verifyBetTransaction(
    txSignature: string,
    expectedWallet: string,
    expectedAmount: number,
  ): Promise<boolean> {
    try {
      // In development, skip verification
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.warn('Skipping TX verification in development mode');
        return true;
      }

      // Fetch transaction
      const tx = await this.connection.getTransaction(txSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        this.logger.warn(`Transaction not found: ${txSignature}`);
        return false;
      }

      // Check if transaction was successful
      if (tx.meta?.err) {
        this.logger.warn(`Transaction failed: ${txSignature}`);
        return false;
      }

      // Verify the transaction includes our program
      const accountKeys = tx.transaction.message.getAccountKeys();
      const programIncluded = accountKeys.staticAccountKeys.some(
        (key) => key.equals(this.programId),
      );

      if (!programIncluded) {
        this.logger.warn(`Transaction doesn't include program: ${txSignature}`);
        return false;
      }

      // TODO: Add more verification:
      // - Check the actual instruction data
      // - Verify the signer matches expectedWallet
      // - Verify the amount matches expectedAmount

      this.logger.log(`Transaction verified: ${txSignature}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error verifying transaction: ${error.message}`);
      return false;
    }
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
