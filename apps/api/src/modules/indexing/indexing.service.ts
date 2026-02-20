import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PublicKey } from '@solana/web3.js';
import { SolanaService } from '../solana/solana.service';
import { IndexingJobData } from '@/common/types/indexing';
import { INDEXING_QUEUE } from './indexing.constants';

const INSTRUCTION_PREFIX = 'Program log: Instruction: ';

@Injectable()
export class IndexingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexingService.name);
  private isIndexing = false;
  private subscriptionId: number | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    @InjectQueue(INDEXING_QUEUE) private readonly indexingQueue: Queue,
  ) {}

  async onModuleInit() {
    const programId = this.configService.get<string>('PROGRAM_ID');
    if (!programId) {
      this.logger.error('PROGRAM_ID environment variable is required for indexing');
      return;
    }
    this.logger.log(`Indexing: localnet, programId=${programId}`);
    setImmediate(() => this.startIndexing());
  }

  async onModuleDestroy() {
    await this.stopIndexing();
  }

  async startIndexing(): Promise<void> {
    if (this.isIndexing) return;
    const programId = this.configService.get<string>('PROGRAM_ID');
    if (!programId) throw new Error('PROGRAM_ID required');
    this.isIndexing = true;
    try {
      await this.startLocalnetIndexing(programId);
      this.logger.log('✅ Indexing started (localnet onLogs)');
    } catch (e: any) {
      this.isIndexing = false;
      throw e;
    }
  }

  async stopIndexing(): Promise<void> {
    if (!this.isIndexing) return;
    this.isIndexing = false;
    try {
      await this.stopLocalnetIndexing();
    } catch (e: any) {
      this.logger.error(`Error stopping indexing: ${e.message}`);
    }
  }

  /**
   * Localnet only: subscribe to program logs.
   * Detect instruction names (e.g. multiple \"Instruction: PlaceBet\"), pass raw payload to responsible modules.
   * Each module parses logs on its own.
   */
  private async startLocalnetIndexing(programId: string): Promise<void> {
    const connection = this.solanaService.getConnection();
    const programPublicKey = new PublicKey(programId);

    this.subscriptionId = connection.onLogs(
      programPublicKey,
      async (logs, context) => {
        if (!this.isIndexing) return;

        const instructions = this.detectInstructions(logs.logs);
        if (instructions.size === 0) return;

        try {
          const slot = context.slot;
          const signature = logs.signature;
          // Use server time instead of RPC getBlockTime to reduce cost and latency
          const blockTime = Math.floor(Date.now() / 1000);

          const jobData: IndexingJobData = {
            instruction: Array.from(instructions)[0] ?? '',
            instructionNames: Array.from(instructions),
            logs: logs.logs,
            signature,
            slot,
            blockTime,
          };

          await this.indexingQueue.add(jobData, {
            jobId: signature, // Idempotency: same tx won't be queued twice
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }, // 1s, 2s, 4s
            removeOnComplete: 100, // Keep last 100 for debugging
          });
        } catch (e: any) {
          this.logger.error(`Indexing error: ${e.message}`, e.stack);
        }
      },
      'confirmed',
    );
    this.logger.log(`Localnet onLogs subscription active (ID: ${this.subscriptionId})`);
  }

  /** Extract all instruction names from logs, e.g. multiple \"Program log: Instruction: PlaceBet\". */
  private detectInstructions(logs: string[]): Set<string> {
    const names = new Set<string>();
    for (const line of logs) {
      if (line.startsWith(INSTRUCTION_PREFIX)) {
        names.add(line.slice(INSTRUCTION_PREFIX.length).trim());
      }
    }
    return names;
  }

  private async stopLocalnetIndexing(): Promise<void> {
    if (this.subscriptionId == null) return;
    const connection = this.solanaService.getConnection();
    await connection.removeOnLogsListener(this.subscriptionId);
    this.subscriptionId = null;
  }

  isActive(): boolean {
    return this.isIndexing;
  }
}
