import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundHistory } from '../../entities/round-history.entity';
import { BetHistory } from '../../entities/bet-history.entity';
import { DistributionHistory } from '../../entities/distribution-history.entity';
import { DistributionHistoryModule } from '../distribution-history/distribution-history.module';
import { RoundHistoryService } from './round-history.service';
import { RoundHistoryController } from './round-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoundHistory, BetHistory, DistributionHistory]),
    DistributionHistoryModule,
  ],
  controllers: [RoundHistoryController],
  providers: [RoundHistoryService],
  exports: [RoundHistoryService],
})
export class RoundHistoryModule {}
