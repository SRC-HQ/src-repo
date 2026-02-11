import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { GameContractService } from '../game/game-contract.service';
import { GameRoundSummaryService } from '../game/game-round-summary.service';
import { REDIS_CHANNELS, REDIS_KEYS } from '../redis/redis.constants';
import {
  GamePhase,
  SPERM_COUNT,
  ServerToClientEvents,
  ClientToServerEvents,
  GameStatePayload,
  PoolUpdatePayload,
  PhaseUpdatePayload,
  RoundResultPayload,
} from '../../common';

/** Single persistent room — every connected client sees the same board */
const GAME_ROOM = 'game:live';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/game',
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'https://app.spermrace.club', 'https://api.spermrace.club'],
    credentials: true,
  },
})
export class GameGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(
    private readonly redisService: RedisService,
    private readonly gameContractService: GameContractService,
    private readonly gameRoundSummaryService: GameRoundSummaryService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Lifecycle ───────────────────────────────────────────────────────

  async onModuleInit() {
    await this.redisService.subscribe(
      REDIS_CHANNELS.POOL_UPDATE,
      (data: PoolUpdatePayload) => this.server.to(GAME_ROOM).emit('pool:update', data),
    );
    await this.redisService.subscribe(
      REDIS_CHANNELS.PHASE_UPDATE,
      (data: PhaseUpdatePayload) => {
        // Strip internal field before emitting
        const { ...payload } = data;
        delete (payload as any).previousRoundId;
        this.server.to(GAME_ROOM).emit('phase:update', payload);
      },
    );
    await this.redisService.subscribe(
      REDIS_CHANNELS.ROUND_RESULT,
      (data: RoundResultPayload) => this.server.to(GAME_ROOM).emit('round:result', data),
    );

    this.logger.log('Subscribed to Redis game channels');
  }

  afterInit() {
    this.logger.log('GameGateway initialized (WebSocket-only transport)');
  }

  /** On connect: join the single room, send current board state */
  async handleConnection(client: Socket) {
    try {
      client.join(GAME_ROOM);

      const roundId = await this.getActiveRoundId();
      if (!roundId) {
        client.emit('error', { code: 'NO_ACTIVE_ROUND', message: 'No active round' });
        return;
      }

      const state = await this.buildGameState(roundId);
      client.emit('game:state', state);

      this.logger.debug(`Client ${client.id} joined ${GAME_ROOM}`);
    } catch (err: any) {
      this.logger.error(`handleConnection error: ${err.message}`, err.stack);
      client.emit('error', { code: 'CONNECTION_ERROR', message: 'Failed to join game' });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  private async buildGameState(roundId: number): Promise<GameStatePayload> {
    const redis = this.redisService.getClient();
    const phaseJson = await redis.get(REDIS_KEYS.roundPhase(roundId));

    if (phaseJson) {
      return this.buildStateFromRedis(roundId, JSON.parse(phaseJson));
    }
    return this.buildStateFromDb(roundId);
  }

  private async buildStateFromRedis(
    roundId: number,
    phase: { phase: GamePhase; startedAt: number; endsAt: number; commitment?: string; winner?: number },
  ): Promise<GameStatePayload> {
    const redis = this.redisService.getClient();
    const spermCount = Number(this.configService.get('SPERM_COUNT', SPERM_COUNT));

    const pipeline = redis.pipeline();
    pipeline.get(REDIS_KEYS.roundTotalPot(roundId));
    for (let i = 0; i < spermCount; i++) {
      pipeline.get(REDIS_KEYS.spermTotalBets(roundId, i));
      pipeline.scard(REDIS_KEYS.spermBettors(roundId, i));
    }

    const results = await pipeline.exec();
    if (!results) return this.buildStateFromDb(roundId);

    const totalPot = String(results[0]?.[1] ?? '0');
    const sperms = [];
    for (let i = 0; i < spermCount; i++) {
      sperms.push({
        spermId: i,
        totalBets: String(results[1 + i * 2]?.[1] ?? '0'),
        bettorCount: Number(results[2 + i * 2]?.[1] ?? 0),
      });
    }

    return {
      roundId,
      phase: phase.phase,
      phaseStartedAt: phase.startedAt,
      phaseEndsAt: phase.endsAt,
      totalPot,
      sperms,
      commitment: phase.commitment,
      winner: phase.winner,
    };
  }

  private async buildStateFromDb(roundId: number): Promise<GameStatePayload> {
    const summary = await this.gameRoundSummaryService.getRoundGeneralSummary(roundId);
    return {
      roundId,
      phase: GamePhase.PREPARATION,
      phaseStartedAt: 0,
      phaseEndsAt: 0,
      totalPot: summary.totalPot,
      sperms: summary.sperms.map((s) => ({
        spermId: s.spermId,
        totalBets: s.totalBet,
        bettorCount: s.uniqueAddressCount,
      })),
    };
  }

  private async getActiveRoundId(): Promise<number | null> {
    const redis = this.redisService.getClient();
    const stored = await redis.get(REDIS_KEYS.ACTIVE_ROUND);
    if (stored) return Number(stored);
    const current = this.gameContractService.getCurrentRoundId();
    return current > 0 ? current : null;
  }
}
