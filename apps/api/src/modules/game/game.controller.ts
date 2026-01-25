import { Controller, Get } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameContractService } from './game-contract.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameGateway: GameGateway,
    private readonly gameContractService: GameContractService,
  ) {}

  /**
   * Get server stats
   */
  @Get('stats')
  getStats() {
    return {
      connectedClients: this.gameGateway.getConnectedClientsCount(),
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
