import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetHistory } from '../../entities/bet-history.entity';
import { BetHistoryService } from './bet-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([BetHistory])],
  providers: [BetHistoryService],
  exports: [BetHistoryService],
})
export class BetHistoryModule {}
