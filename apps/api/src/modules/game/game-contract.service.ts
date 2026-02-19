import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BN } from '@coral-xyz/anchor';
import { SolanaService } from '../solana/solana.service';
import { RngService } from '../rng/rng.service';
import {
  DEFAULT_SLOT_MS,
  END_SLOT_BUFFER,
  MAX_SLOT_MS,
  MIN_SLOT_MS,
  PHASE_DURATIONS,
  GamePhase,
  SPERM_COUNT,
  SpermRaceParams,
} from '../../common';
import { RedisService } from '../redis/redis.service';
import {
  REDIS_CHANNELS,
  REDIS_KEYS,
  ROUND_KEY_TTL,
} from '../redis/redis.constants';
import * as crypto from 'crypto';

/**
 * Service that manages the game loop and interacts with the Solana smart contract
 */
@Injectable()
export class GameContractService implements OnModuleInit {
  private readonly logger = new Logger(GameContractService.name);
  private isRunning = false;
  private currentRoundId: number = 0;
  private currentServerSeed: Buffer | null = null;
  private currentHashedSeed: number[] | null = null;
  private currentEndSlot: number | null = null;
  /** Slot at round start (for measuring cluster slot speed). */
  private currentRoundStartSlot: number | null = null;
  /** Time at round start (ms) for slot-speed measurement. */
  private currentRoundStartTime: number | null = null;
  /**
   * Observed ms per slot for this cluster. Updated after each resolve; first round uses DEFAULT_SLOT_MS.
   * Makes end_slot work without config regardless of cluster speed.
   */
  private slotMsEstimate: number = DEFAULT_SLOT_MS;

  // State Tracking
  private currentPhase: GamePhase = GamePhase.PREPARATION;
  private currentPhaseEndsAt: number = 0;
  private currentPhaseStartTime: number = 0;
  // private lastDistributionEvent: DistributionEvent | null = null;
  private currentWinnerId: number | null = null;
  private currentPositions: number[] = [];

  // Phase durations
  private preparationDuration: number;
  private resolutionDuration: number;
  private distributionDuration: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    private readonly rngService: RngService,
    private readonly redisService: RedisService,
  ) {
    // Note: configService.get() returns strings from .env — must coerce to number
    this.preparationDuration = Number(
      this.configService.get('PREPARATION_DURATION_MS', PHASE_DURATIONS.PREPARATION),
    );
    this.resolutionDuration = Number(
      this.configService.get('RESOLUTION_DURATION_MS', PHASE_DURATIONS.RESOLUTION),
    );
    this.distributionDuration = Number(
      this.configService.get('DISTRIBUTION_DURATION_MS', PHASE_DURATIONS.DISTRIBUTION),
    );
  }

  async onModuleInit() {
    // Check if game is initialized on-chain
    await this.ensureGameInitialized();

    // Start the game loop
    this.logger.log('Game contract service initialized, starting game loop...');
    setTimeout(() => this.startGameLoop(), 2000);
  }

  /**
   * Ensure the game is initialized on-chain
   */
  private async ensureGameInitialized(): Promise<void> {
    try {
      const contractClient = this.solanaService.getContractClient();
      const programId = this.solanaService.getProgramId();
      const globalState = await contractClient.fetchGlobalState(programId);

      if (!globalState) {
        const authorityWallet = this.solanaService.getAuthorityWallet();
        if (!authorityWallet) {
          this.logger.error('Cannot initialize game: Authority wallet not loaded');
          return;
        }
        const treasuryPubkey = this.solanaService.getTreasuryWalletPublicKey();

        await this.retryTransaction(
          () =>
            contractClient.initializeGame(
              programId,
              authorityWallet.publicKey,
              treasuryPubkey,
            ),
          'initializeGame',
        );
        this.logger.log('Game initialized successfully');
      } else {
        this.logger.log(
          `Game already initialized. Current round: ${globalState.currentRound.toString()}`,
        );
        this.currentRoundId = globalState.currentRound.toNumber();
      }
    } catch (error: any) {
      // Rethrow if TREASURY_WALLET is missing so the app does not start
      if (error.message?.includes('TREASURY_WALLET')) {
        throw error;
      }
      this.logger.error(`Failed to ensure game initialization: ${error.message}`);
    }
  }

  /**
   * Main game loop - runs continuously
   */
  private async startGameLoop(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Game loop already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('🎮 Game loop started!');

    while (this.isRunning) {
      try {
        // Get current round from chain
        const contractClient = this.solanaService.getContractClient();
        const programId = this.solanaService.getProgramId();
        const globalState = await contractClient.fetchGlobalState(programId);

        if (globalState) {
          this.currentRoundId = globalState.currentRound.toNumber();
        }

        // Increment for next round
        const nextRoundId = this.currentRoundId + 1;

        this.logger.log(`📍 Starting round ${nextRoundId}`);

        // Phase 1: Preparation (60s)
        await this.runPreparationPhase(nextRoundId);

        // Phase 2: Resolution (30s)
        await this.runResolutionPhase(nextRoundId);

        // Phase 3: Distribution (30s)
        await this.runDistributionPhase(nextRoundId);

        // Update current round
        this.currentRoundId = nextRoundId;
      } catch (error: any) {
        this.logger.error(`Error in game loop: ${error.message}`, error.stack);
        // Wait a bit before retrying
        await this.sleep(5000);
      }
    }
  }

  /**
   * Preparation Phase - Start round on-chain with commitment and end_slot 
   */
  private async runPreparationPhase(roundId: number): Promise<void> {
    this.logger.log(`⏳ Preparation phase started (Round ${roundId})`);
    
    // Update State
    this.currentPhase = GamePhase.PREPARATION;
    this.currentPhaseStartTime = Date.now();
    this.currentPhaseEndsAt = this.currentPhaseStartTime + this.preparationDuration;
    this.currentWinnerId = null;
    this.currentPositions = [];

    // Generate server seed and hash
    this.currentServerSeed = crypto.randomBytes(32);
    const hasher = crypto.createHash('sha256');
    hasher.update(this.currentServerSeed);
    const hashBuffer = hasher.digest();
    this.currentHashedSeed = Array.from(hashBuffer);

    const currentSlot = await this.solanaService.getCurrentSlot();
    this.currentRoundStartSlot = currentSlot;
    this.currentRoundStartTime = Date.now();
    // end_slot from phase duration using observed cluster slot speed (or conservative default).
    // end_slot must be in the past when we resolve; buffer covers RPC/clock drift.
    const slotsDuringPreparation = Math.floor(this.preparationDuration / this.slotMsEstimate);
    const endSlot = currentSlot + Math.max(1, slotsDuringPreparation - END_SLOT_BUFFER);
    this.currentEndSlot = endSlot;

    this.logger.log(
      `🔐 Generated hashed seed: ${hashBuffer.toString('hex').substring(0, 16)}... end_slot=${endSlot}`,
    );

    const authorityWallet = this.solanaService.getAuthorityWallet();
    if (!authorityWallet) {
      throw new Error('Authority wallet not available');
    }

    const contractClient = this.solanaService.getContractClient();
    const programId = this.solanaService.getProgramId();
    await this.retryTransaction(
      () =>
        contractClient.startRound(
          programId,
          authorityWallet.publicKey,
          this.currentHashedSeed!,
          new BN(roundId),
          new BN(endSlot),
        ),
      'startRound',
    );

    this.logger.log(`✅ Round ${roundId} started on-chain (end_slot=${endSlot})`);

    // ─── Redis: set active round state & publish phase change ───
    const phaseStartedAt = Date.now();
    const phaseEndsAt = phaseStartedAt + this.preparationDuration;
    const redis = this.redisService.getClient();
    const initPipeline = redis.pipeline();
    initPipeline.set(REDIS_KEYS.ACTIVE_ROUND, String(roundId));
    initPipeline.set(
      REDIS_KEYS.roundPhase(roundId),
      JSON.stringify({
        phase: GamePhase.PREPARATION,
        startedAt: phaseStartedAt,
        endsAt: phaseEndsAt,
        commitment: hashBuffer.toString('hex'),
      }),
    );
    initPipeline.set(REDIS_KEYS.roundTotalPot(roundId), '0');
    await initPipeline.exec();

    await this.redisService.publish(REDIS_CHANNELS.PHASE_UPDATE, {
      roundId,
      phase: GamePhase.PREPARATION,
      startedAt: phaseStartedAt,
      endsAt: phaseEndsAt,
      commitment: hashBuffer.toString('hex'),
      totalPot: '0',
    });

    await this.sleep(this.preparationDuration);
  }

  /**
   * Resolution Phase - Lock betting, derive winner/baby_king
   */
  private async runResolutionPhase(roundId: number): Promise<void> {
    this.logger.log(`🏁 Resolution phase started (Round ${roundId})`);

    // Update State
    this.currentPhase = GamePhase.RESOLUTION;
    this.currentPhaseStartTime = Date.now();
    this.currentPhaseEndsAt = this.currentPhaseStartTime + this.resolutionDuration;

    const authorityWallet = this.solanaService.getAuthorityWallet();
    if (!authorityWallet) {
      throw new Error('Authority wallet not available');
    }

    const contractClient = this.solanaService.getContractClient();
    const programId = this.solanaService.getProgramId();

    await this.retryTransaction(
      () => contractClient.lockBetting(programId, authorityWallet.publicKey, new BN(roundId)),
      'lockBetting',
    );
    this.logger.log(`🔒 Betting locked for round ${roundId}`);


    const endSlot = this.currentEndSlot;
    const roundStartSlot = this.currentRoundStartSlot;
    const roundStartTime = this.currentRoundStartTime;
    if (endSlot == null) {
      throw new Error('currentEndSlot not set; cannot derive winner');
    }
    const slotHash = await this.solanaService.getSlotHashForSlot(endSlot);
    // Measure cluster slot speed for next round (no config needed)
    if (roundStartSlot != null && roundStartTime != null) {
      const slotNow = await this.solanaService.getCurrentSlot();
      const slotsElapsed = slotNow - roundStartSlot;
      const msElapsed = Date.now() - roundStartTime;
      if (slotsElapsed > 0 && msElapsed > 0) {
        const observed = msElapsed / slotsElapsed;
        const clamped = Math.max(MIN_SLOT_MS, Math.min(MAX_SLOT_MS, observed));
        this.slotMsEstimate = clamped;
        this.logger.log(
          `Slot speed: ${observed.toFixed(0)}ms/slot (using ${this.slotMsEstimate.toFixed(0)}ms for next round)`,
        );
      }
    }
    if (!slotHash || slotHash.length !== 32) {
      throw new Error(
        `Slot hash not found for end_slot=${endSlot}. Resolve must happen within ~512 slots after end_slot.`,
      );
    }
    const { winnerId, babyKingHit } = this.rngService.deriveWinnerAndBabyKing(
      slotHash,
      this.currentServerSeed!,
      roundId,
    );

    const spermCount = Number(this.configService.get('SPERM_COUNT', SPERM_COUNT));
    const raceParams = this.rngService.deriveRaceParams(
      slotHash,
      this.currentServerSeed!,
      roundId,
      winnerId,
      spermCount,
    );

    this.logger.log(
      `🎲 Winner Sperm #${winnerId}, baby_king=${babyKingHit}`,
    );

    const serverSeedArray = Array.from(this.currentServerSeed!);
    await this.retryTransaction(
      () =>
        contractClient.resolveRound(
          programId,
          authorityWallet.publicKey,
          new BN(roundId),
          serverSeedArray,
        ),
      'resolveRound',
    );
    this.logger.log(`✅ Round ${roundId} resolved on-chain: Winner sperm #${winnerId}`);

    const phaseStartedAt = Date.now();
    const phaseEndsAt = phaseStartedAt + this.resolutionDuration;

    // ─── Redis + socket: only after on-chain resolve succeeded ───
    {
      const redis = this.redisService.getClient();
      await redis.set(
        REDIS_KEYS.roundPhase(roundId),
        JSON.stringify({
          phase: GamePhase.RESOLUTION,
          startedAt: phaseStartedAt,
          endsAt: phaseEndsAt,
          winner: winnerId,
          raceParams,
        }),
      );
      await this.redisService.publish(REDIS_CHANNELS.PHASE_UPDATE, {
        roundId,
        phase: GamePhase.RESOLUTION,
        startedAt: phaseStartedAt,
        endsAt: phaseEndsAt,
        winner: winnerId,
        raceParams,
      });

      const totalPot =
        (await redis.get(REDIS_KEYS.roundTotalPot(roundId))) || '0';
      const leaderboard = this.rngService.computeLeaderboard(raceParams);
      await this.redisService.publish(REDIS_CHANNELS.ROUND_RESULT, {
        roundId,
        winnerId,
        totalPot,
        isBabyKingHit: babyKingHit,
        raceParams,
        leaderboard,
      });
    }

    const remaining = phaseEndsAt - Date.now();
    if (remaining > 0 && remaining <= this.resolutionDuration) {
      await this.sleep(remaining);
    }
  }

  /**
   * Distribution Phase - Allow users to claim winnings
   */
  private async runDistributionPhase(roundId: number): Promise<void> {
    this.logger.log(`💰 Distribution phase started (Round ${roundId})`);

    const phaseStartedAt = Date.now();
    const phaseEndsAt = phaseStartedAt + this.distributionDuration;

    // Read winner + totalPot from Redis (already set during resolution — no RPC needed)
    const redis = this.redisService.getClient();
    const [phaseJson, totalPot] = await Promise.all([
      redis.get(REDIS_KEYS.roundPhase(roundId)),
      redis.get(REDIS_KEYS.roundTotalPot(roundId)),
    ]);

    const prevPhase = phaseJson ? JSON.parse(phaseJson) : {};
    const winnerId: number | undefined = prevPhase.winner;
    const pot = totalPot || '0';
    const raceParams = prevPhase.raceParams as unknown[] | undefined;
    const leaderboard =
      raceParams?.length != null
        ? this.rngService.computeLeaderboard(raceParams as SpermRaceParams[])
        : undefined;

    this.logger.log(`Round ${roundId} - Winner: #${winnerId}, Total Pot: ${pot} lamports`);

    // ─── Redis: publish distribution phase (includes leaderboard for late joiners) ───
    {
      const phasePayload = {
        phase: GamePhase.DISTRIBUTION,
        startedAt: phaseStartedAt,
        endsAt: phaseEndsAt,
        winner: winnerId,
        ...(leaderboard != null && { leaderboard }),
      };
      await redis.set(REDIS_KEYS.roundPhase(roundId), JSON.stringify(phasePayload));
      await this.redisService.publish(REDIS_CHANNELS.PHASE_UPDATE, {
        roundId,
        phase: GamePhase.DISTRIBUTION,
        startedAt: phaseStartedAt,
        endsAt: phaseEndsAt,
        winner: winnerId,
        totalPot: pot,
        ...(leaderboard != null && { leaderboard }),
      });
    }

    // Wait for phase to end
    await this.sleep(this.distributionDuration);

    this.currentServerSeed = null;
    this.currentHashedSeed = null;
    this.currentEndSlot = null;
    this.currentRoundStartSlot = null;
    this.currentRoundStartTime = null;

    // Expire old round Redis keys (5 min grace period)
    await this.expireRoundKeys(roundId);
  }

  /**
   * Set TTL on all Redis keys for a finished round to prevent memory bloat.
   */
  private async expireRoundKeys(roundId: number): Promise<void> {
    try {
      const redis = this.redisService.getClient();
      const spermCount = this.configService.get<number>(
        'SPERM_COUNT',
        SPERM_COUNT,
      );
      const pipeline = redis.pipeline();
      pipeline.expire(REDIS_KEYS.roundPhase(roundId), ROUND_KEY_TTL);
      pipeline.expire(REDIS_KEYS.roundTotalPot(roundId), ROUND_KEY_TTL);
      for (let i = 0; i < spermCount; i++) {
        pipeline.expire(
          REDIS_KEYS.spermTotalBets(roundId, i),
          ROUND_KEY_TTL,
        );
        pipeline.expire(REDIS_KEYS.spermBettors(roundId, i), ROUND_KEY_TTL);
      }
      await pipeline.exec();
    } catch (err: any) {
      this.logger.warn(
        `Failed to expire round ${roundId} Redis keys: ${err.message}`,
      );
    }
  }

  /**
   * Retry a transaction up to 3 times
   */
  private async retryTransaction<T>(
    fn: () => Promise<T>,
    operation: string,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting ${operation} (attempt ${attempt}/${maxRetries})`);
        const result = await fn();
        return result;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `❌ ${operation} failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
        );
        if (attempt < maxRetries) {
          await this.sleep(1500 * attempt); // Exponential backoff
        }
      }
    }

    throw new Error(`${operation} failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Get current round ID
   */
  getCurrentRoundId(): number {
    return this.currentRoundId;
  }

  private sleep(ms: number): Promise<void> {
    // Safety check: setTimeout only accepts 32-bit signed integers (max ~2.1 billion ms = ~24 days)
    // Clamp to maximum safe value to prevent TimeoutOverflowWarning
    const MAX_SAFE_TIMEOUT = 2147483647; // 2^31 - 1
    const safeMs = Math.max(0, Math.min(ms, MAX_SAFE_TIMEOUT));

    return new Promise((resolve) => setTimeout(resolve, safeMs));
  }
}
