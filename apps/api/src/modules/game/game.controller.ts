import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameGateway: GameGateway,
  ) {}

  /**
   * Get current game state
   */
  @Get('state')
  getState() {
    return this.gameService.getCurrentState();
  }

  /**
   * Get server stats
   */
  @Get('stats')
  getStats() {
    return {
      connectedClients: this.gameGateway.getConnectedClientsCount(),
      currentRound: this.gameService.getCurrentRoundId(),
      canAcceptBets: this.gameService.canAcceptBets(),
    };
  }

  /**
   * Health check
   */
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
