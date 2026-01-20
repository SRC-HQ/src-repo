import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { BettingModule } from '../betting/betting.module';
import { RngModule } from '../rng/rng.module';

@Module({
  imports: [BettingModule, RngModule],
  providers: [GameService, GameGateway],
  controllers: [GameController],
  exports: [GameService, GameGateway],
})
export class GameModule {}
