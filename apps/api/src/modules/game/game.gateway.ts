import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
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
  GameStateEvent,
  PlaceBetResponse,
  PlaceBetPayload,
  PoolUpdatedEvent,
  PoolState,
} from '../../common';

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

  setServices(gameService: any) {
    this.gameService = gameService;
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
    this.logger.log(
      `Bet received from ${client.id}: Sperm #${data.spermId}, ${data.amount} lamports`,
    );

    try {
      // Check if betting is allowed
      if (!this.gameService?.canAcceptBets()) {
        return {
          success: false,
          error: 'Betting is not currently allowed',
        };
      }

      // Process the bet
      const result = await this.gameService.placeBet({
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

  broadcastPoolUpdated(spermId: number, pools: PoolState[]) {
    // Calculate total pool
    const totalPool = pools.reduce((sum, pool) => sum + pool.totalBets, 0);

    // Extract odds
    const odds = pools.map((pool) => pool.odds);

    const event: PoolUpdatedEvent = {
      spermId,
      totalPool,
      odds,
      pools,
    };

    this.logger.log(
      `Broadcasting pool update for sperm ${spermId}. Total pool: ${totalPool}`,
    );
    this.server.emit('pool:updated', event);
  }

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

}
