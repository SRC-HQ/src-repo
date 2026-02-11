import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionHistory } from '@/entities/distribution-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';
import { DistributionHistoryService } from './distribution-history.service';
import { DistributionHistoryController } from './distribution-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionHistory, BetHistory])],
  providers: [DistributionHistoryService],
  controllers: [DistributionHistoryController],
  exports: [DistributionHistoryService],
})
export class DistributionHistoryModule {}
