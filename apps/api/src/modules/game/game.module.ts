import { Module } from '@nestjs/common';
import { GameContractService } from './game-contract.service';
import { GameGateway } from './game.gateway';
import { RngModule } from '../rng/rng.module';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [RngModule, SolanaModule],
  providers: [GameContractService, GameGateway],
  exports: [GameContractService, GameGateway],
})
export class GameModule {}
