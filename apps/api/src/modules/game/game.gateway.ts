import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  PhaseChangeEvent,
  RaceStartEvent,
  PositionsEvent,
  DistributionEvent,
  PlaceBetPayload,
  PlaceBetResponse,
  GameStateEvent,
} from '@sperm-race/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private connectedClients: Map<string, Socket> = new Map();
  private gameService: any; // Will be injected later to avoid circular dependency
  private bettingService: any;

  setServices(gameService: any, bettingService: any) {
    this.gameService = gameService;
    this.bettingService = bettingService;
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);

    // Send current game state to new client
    if (this.gameService) {
      const state = this.gameService.getCurrentState();
      client.emit('game:state', state as GameStateEvent);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  /**
   * Handle bet placement from client
   */
  @SubscribeMessage('bet:place')
  async handlePlaceBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlaceBetPayload,
  ): Promise<PlaceBetResponse> {
    this.logger.log(`Bet received from ${client.id}: Sperm #${data.spermId}, ${data.amount} lamports`);

    try {
      // Check if betting is allowed
      if (!this.gameService?.canAcceptBets()) {
        return {
          success: false,
          error: 'Betting is not currently allowed',
        };
      }

      // Process the bet
      const result = await this.bettingService.placeBet({
        roundId: this.gameService.getCurrentRoundId(),
        walletAddress: data.txSignature.substring(0, 44), // TODO: Extract from TX
        spermId: data.spermId,
        amount: data.amount,
        txSignature: data.txSignature,
      });

      // Broadcast pool update to all clients
      this.broadcastPoolUpdated(result.spermId, result.pools);

      return {
        success: true,
        betId: result.betId,
      };
    } catch (error: any) {
      this.logger.error(`Error placing bet: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Failed to place bet',
      };
    }
  }

  // ===========================================
  // Broadcast Methods (called by GameService)
  // ===========================================

  broadcastPhaseChange(data: PhaseChangeEvent) {
    this.logger.log(`Broadcasting phase change: ${data.phase}`);
    this.server.emit('phase:change', data);
  }

  broadcastRaceStart(data: RaceStartEvent) {
    this.logger.log(`Broadcasting race start: Winner #${data.winner}`);
    this.server.emit('race:start', data);
  }

  broadcastPositions(data: PositionsEvent) {
    this.server.emit('race:positions', data);
  }

  broadcastDistribution(data: DistributionEvent) {
    this.logger.log(`Broadcasting distribution: ${data.winners.length} winners`);
    this.server.emit('distribution:results', data);
  }

  broadcastPoolUpdated(spermId: number, pools: any[]) {
    const totalPool = pools.reduce((sum, p) => sum + p.totalBets, 0);
    const odds = this.calculateOdds(pools, totalPool);

    this.server.emit('pool:updated', {
      spermId,
      totalPool,
      odds,
      pools,
    });
  }

  private calculateOdds(pools: any[], totalPool: number): number[] {
    if (totalPool === 0) {
      return pools.map(() => 1);
    }

    const houseFee = 0.15; // 15%
    const netPool = totalPool * (1 - houseFee);

    return pools.map((pool) => {
      if (pool.totalBets === 0) return 0;
      return Math.round((netPool / pool.totalBets) * 100) / 100;
    });
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
