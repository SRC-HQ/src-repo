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
          const blockTime = await connection.getBlockTime(slot).catch(() => null);

          const payload: RawInstructionPayload = {
            // Keep a representative instruction for backwards compatibility; services should rely on events.
            instruction: Array.from(instructions)[0] ?? '',
            logs: logs.logs,
            signature,
            slot,
            blockTime,
          };

          if (instructions.has('PlaceBet') || instructions.has('ReclaimBetRent')) {
            await this.betHistoryService.handleInstruction(payload);
          }

          if (
            instructions.has('StartRound') ||
            instructions.has('LockBetting') ||
            instructions.has('ResolveRound') ||
            instructions.has('ClaimWinnings')
          ) {
            await this.roundHistoryService.handleInstruction(payload);
          }
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
