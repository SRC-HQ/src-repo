import { Module } from '@nestjs/common';
import { IndexingService } from './indexing.service';
import { SolanaModule } from '../solana/solana.module';
import { BetHistoryModule } from '../bet-history/bet-history.module';
import { RoundHistoryModule } from '../round-history/round-history.module';

@Module({
  imports: [SolanaModule, BetHistoryModule, RoundHistoryModule],
  providers: [IndexingService],
  exports: [IndexingService],
})
export class IndexingModule {}
