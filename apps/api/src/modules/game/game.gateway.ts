import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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

}
