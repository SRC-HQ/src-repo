import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameContractService } from './game-contract.service';
import { GameRoundSummaryService } from './game-round-summary.service';
import { GameRoundSummaryController } from './game-round-summary.controller';
import { RngModule } from '../rng/rng.module';
import { SolanaModule } from '../solana/solana.module';
import { RoundHistory } from '@/entities/round-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';

@Module({
  imports: [RngModule, SolanaModule, TypeOrmModule.forFeature([RoundHistory, BetHistory])],
  providers: [GameContractService, GameRoundSummaryService],
  controllers: [GameRoundSummaryController],
  exports: [GameContractService, GameRoundSummaryService],
})
export class GameModule {}
