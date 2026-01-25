import { Module } from '@nestjs/common';
import { GameContractService } from './game-contract.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { BettingModule } from '../betting/betting.module';
import { RngModule } from '../rng/rng.module';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [BettingModule, RngModule, SolanaModule],
  providers: [GameContractService, GameGateway],
  controllers: [GameController],
  exports: [GameContractService, GameGateway],
})
export class GameModule {}
