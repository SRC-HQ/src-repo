import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameModule } from '../game/game.module';

/**
 * Socket module — owns all WebSocket gateways.
 *
 * Imports GameModule to access GameContractService and GameRoundSummaryService.
 * RedisService is available globally via RedisModule.
 */
@Module({
  imports: [GameModule],
  providers: [GameGateway],
})
export class SocketModule {}
