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

@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/game',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

  /**
   * Subscribe to Redis Pub/Sub channels.
   * This is the "stealth" listener — the gateway never polls the DB.
   * All live updates arrive via Redis Pub/Sub from the services that write to the DB.
   */
  async onModuleInit() {
    await this.redisService.subscribe(
      REDIS_CHANNELS.POOL_UPDATE,
      (data: PoolUpdatePayload) => this.onPoolUpdate(data),
    );
    await this.redisService.subscribe(
      REDIS_CHANNELS.PHASE_UPDATE,
      (data: PhaseUpdatePayload & { previousRoundId?: number }) =>
        this.onPhaseUpdate(data),
    );
    await this.redisService.subscribe(
      REDIS_CHANNELS.ROUND_RESULT,
      (data: RoundResultPayload) => this.onRoundResult(data),
    );

    this.logger.log('Subscribed to Redis game channels');
  }

  afterInit() {
    this.logger.log('GameGateway initialized (WebSocket-only transport)');
  }

  /**
   * On client connect:
   *   1) Join the current round's room
   *   2) Emit the full game state snapshot so the UI renders immediately
   */
  async handleConnection(client: Socket) {
    try {
      const roundId = await this.getActiveRoundId();
      if (!roundId) {
        this.logger.warn(
          `Client ${client.id} connected but no active round found`,
        );
        client.emit('error', {
          code: 'NO_ACTIVE_ROUND',
          message: 'No active round',
        });
        return;
      }

      const room = this.roomName(roundId);
      client.join(room);

      const state = await this.buildGameState(roundId);
      client.emit('game:state', state);

      this.logger.debug(`Client ${client.id} joined ${room}`);
    } catch (err: any) {
      this.logger.error(
        `handleConnection error: ${err.message}`,
        err.stack,
      );
      client.emit('error', {
        code: 'CONNECTION_ERROR',
        message: 'Failed to join game',
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  // ─── Redis Pub/Sub handlers ──────────────────────────────────────────

  /**
   * A new bet was indexed → broadcast the updated pool numbers to the room.
   */
  private onPoolUpdate(data: PoolUpdatePayload) {
    const room = this.roomName(data.roundId);
    this.server.to(room).emit('pool:update', data);
  }

  /**
   * Phase changed → broadcast to room.
   * When a brand-new round starts (preparation phase), migrate every connected
   * client from the old round room to the new one.
   */
  private async onPhaseUpdate(
    data: PhaseUpdatePayload & { previousRoundId?: number },
  ) {
    const { roundId, previousRoundId, ...rest } = data;
    const newRoom = this.roomName(roundId);

    // Room migration on new round
    if (previousRoundId != null && previousRoundId !== roundId) {
      const oldRoom = this.roomName(previousRoundId);
      try {
        const sockets = await this.server.in(oldRoom).fetchSockets();
        for (const socket of sockets) {
          socket.leave(oldRoom);
          socket.join(newRoom);
        }
        this.logger.log(
          `Migrated ${sockets.length} clients: ${oldRoom} → ${newRoom}`,
        );
      } catch (err: any) {
        this.logger.error(`Room migration failed: ${err.message}`);
      }
    }

    // Emit (strip the internal previousRoundId field)
    const payload: PhaseUpdatePayload = {
      roundId,
      phase: rest.phase,
      startedAt: rest.startedAt,
      endsAt: rest.endsAt,
      commitment: rest.commitment,
      winner: rest.winner,
      totalPot: rest.totalPot,
    };
    this.server.to(newRoom).emit('phase:update', payload);
  }

  /**
   * Round resolved with a winner → broadcast to the room.
   */
  private onRoundResult(data: RoundResultPayload) {
    const room = this.roomName(data.roundId);
    this.server.to(room).emit('round:result', data);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  /**
   * Build the full game state snapshot.
   * Fast path: read from Redis (single pipeline round-trip).
   * Fallback:  query the DB via GameRoundSummaryService (server restart mid-round).
   */
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
    phase: {
      phase: GamePhase;
      startedAt: number;
      endsAt: number;
      commitment?: string;
      winner?: number;
    },
  ): Promise<GameStatePayload> {
    const redis = this.redisService.getClient();
    const spermCount = this.configService.get<number>(
      'SPERM_COUNT',
      SPERM_COUNT,
    );

    // Pipeline all reads → single network round-trip
    const pipeline = redis.pipeline();
    pipeline.get(REDIS_KEYS.roundTotalPot(roundId));
    for (let i = 0; i < spermCount; i++) {
      pipeline.get(REDIS_KEYS.spermTotalBets(roundId, i));
      pipeline.scard(REDIS_KEYS.spermBettors(roundId, i));
    }

    const results = await pipeline.exec();
    if (!results) {
      return this.buildStateFromDb(roundId);
    }

    const totalPot = String(results[0]?.[1] ?? '0');
    const sperms = [];
    for (let i = 0; i < spermCount; i++) {
      const betsIdx = 1 + i * 2;
      const countIdx = 2 + i * 2;
      sperms.push({
        spermId: i,
        totalBets: String(results[betsIdx]?.[1] ?? '0'),
        bettorCount: Number(results[countIdx]?.[1] ?? 0),
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

  /** DB fallback for when Redis state is empty (e.g. server restart mid-round) */
  private async buildStateFromDb(
    roundId: number,
  ): Promise<GameStatePayload> {
    const summary =
      await this.gameRoundSummaryService.getRoundGeneralSummary(roundId);
    return {
      roundId,
      phase: GamePhase.PREPARATION,
      phaseStartedAt: 0,
      phaseEndsAt: 0, // Unknown — client should show "Syncing…"
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

    // Fallback: contract service's in-memory round ID
    const current = this.gameContractService.getCurrentRoundId();
    return current > 0 ? current : null;
  }

  private roomName(roundId: number): string {
    return `round:${roundId}`;
  }
}
