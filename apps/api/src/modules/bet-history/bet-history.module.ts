import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetHistory } from '../../entities/bet-history.entity';
import { BetHistoryService } from './bet-history.service';
import { BetHistoryController } from './bet-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BetHistory])],
  providers: [BetHistoryService],
  controllers: [BetHistoryController],
  exports: [BetHistoryService],
})
export class BetHistoryModule {}
