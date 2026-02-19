import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IndexingService } from './indexing.service';
import { IndexingProcessor } from './indexing.processor';
import { SolanaModule } from '../solana/solana.module';
import { BetHistoryModule } from '../bet-history/bet-history.module';
import { RoundHistoryModule } from '../round-history/round-history.module';
import { INDEXING_QUEUE } from './indexing.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: INDEXING_QUEUE }),
    SolanaModule,
    BetHistoryModule,
    RoundHistoryModule,
  ],
  providers: [IndexingService, IndexingProcessor],
  exports: [IndexingService],
})
export class IndexingModule {}
