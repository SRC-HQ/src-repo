import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundHistory } from '../../entities/round-history.entity';
import { BetHistory } from '../../entities/bet-history.entity';
import { DistributionHistoryModule } from '../distribution-history/distribution-history.module';
import { RoundHistoryService } from './round-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoundHistory, BetHistory]),
    DistributionHistoryModule,
  ],
  providers: [RoundHistoryService],
  exports: [RoundHistoryService],
})
export class RoundHistoryModule {}
