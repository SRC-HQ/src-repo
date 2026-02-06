import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundHistory } from '../../entities/round-history.entity';
import { BetHistory } from '../../entities/bet-history.entity';
import { DistributionHistory } from '../../entities/distribution-history.entity';
import { RoundHistoryService } from './round-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoundHistory, BetHistory, DistributionHistory])],
  providers: [RoundHistoryService],
  exports: [RoundHistoryService],
})
export class RoundHistoryModule {}
