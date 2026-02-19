import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BetHistoryService } from '../bet-history/bet-history.service';
import { RoundHistoryService } from '../round-history/round-history.service';
import { IndexingJobData } from '@/common/types/indexing';
import { INDEXING_QUEUE } from './indexing.constants';

@Processor(INDEXING_QUEUE)
export class IndexingProcessor {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private readonly betHistoryService: BetHistoryService,
    private readonly roundHistoryService: RoundHistoryService,
  ) {}

  @Process({ concurrency: 20 }) // Process up to 20 jobs at a time (bounded concurrency)
  async handleIndexingJob(job: Job<IndexingJobData>): Promise<void> {
    const { instructionNames, ...payload } = job.data;
    const instructions = new Set(instructionNames);

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
  }
}
