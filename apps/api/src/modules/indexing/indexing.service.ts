import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicKey } from '@solana/web3.js';
import { SolanaService } from '../solana/solana.service';
import { BetHistoryService } from '../bet-history/bet-history.service';
import { RoundHistoryService } from '../round-history/round-history.service';
import { RawInstructionPayload } from '@/common/types/indexing';

const INSTRUCTION_PREFIX = 'Program log: Instruction: ';

@Injectable()
export class IndexingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexingService.name);
  private isIndexing = false;
  private subscriptionId: number | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    private readonly betHistoryService: BetHistoryService,
    private readonly roundHistoryService: RoundHistoryService,
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
   * Detect instruction name (e.g. "Instruction: PlaceBet"), pass raw payload to responsible module.
   * Each module parses logs on its own.
   */
  private async startLocalnetIndexing(programId: string): Promise<void> {
    const connection = this.solanaService.getConnection();
    const programPublicKey = new PublicKey(programId);

    this.subscriptionId = connection.onLogs(
      programPublicKey,
      async (logs, context) => {
        if (!this.isIndexing) return;

        const instruction = this.detectInstruction(logs.logs);
        if (!instruction) return;

        try {
          const slot = context.slot;
          const signature = logs.signature;
          const blockTime = await connection.getBlockTime(slot).catch(() => null);

          const payload: RawInstructionPayload = {
            instruction,
            logs: logs.logs,
            signature,
            slot,
            blockTime,
          };

          if (instruction === 'PlaceBet') {
            await this.betHistoryService.handleInstruction(payload);
          } else if (instruction === 'StartRound') {
            await this.roundHistoryService.handleInstruction(payload);
          }
          // Future: else if (instruction === 'ClaimWinnings') { await this.claimHistoryService.handleInstruction(payload); }
        } catch (e: any) {
          this.logger.error(`Indexing error: ${e.message}`, e.stack);
        }
      },
      'confirmed',
    );
    this.logger.log(`Localnet onLogs subscription active (ID: ${this.subscriptionId})`);
  }

  /** Extract instruction name from logs, e.g. "Program log: Instruction: PlaceBet" -> "PlaceBet". */
  private detectInstruction(logs: string[]): string | null {
    for (const line of logs) {
      if (line.startsWith(INSTRUCTION_PREFIX)) {
        return line.slice(INSTRUCTION_PREFIX.length).trim();
      }
    }
    return null;
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
