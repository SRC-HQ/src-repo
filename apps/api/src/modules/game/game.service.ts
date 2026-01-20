import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GamePhase,
  RoundState,
  PoolState,
  SPERM_COUNT,
  PHASE_DURATIONS,
  HOUSE_FEE_PERCENT,
  RACE_FPS,
} from '@sperm-race/shared';
import { GameGateway } from './game.gateway';
import { BettingService } from '../betting/betting.service';
import { RngService } from '../rng/rng.service';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);

  // Current game state
  private currentPhase: GamePhase = GamePhase.PREPARATION;
  private roundId: number = 0;
  private phaseEndsAt: number = 0;
  private commitment: string | null = null;
  private seed: string | null = null;
  private winner: number | null = null;
  private positions: number[] = Array(SPERM_COUNT).fill(0);

  // Phase durations (can be overridden by config)
  private preparationDuration: number;
  private resolutionDuration: number;
  private distributionDuration: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly gateway: GameGateway,
    private readonly bettingService: BettingService,
    private readonly rngService: RngService,
  ) {
    this.preparationDuration = this.configService.get<number>(
      'PREPARATION_DURATION_MS',
      PHASE_DURATIONS.PREPARATION,
    );
    this.resolutionDuration = this.configService.get<number>(
      'RESOLUTION_DURATION_MS',
      PHASE_DURATIONS.RESOLUTION,
    );
    this.distributionDuration = this.configService.get<number>(
      'DISTRIBUTION_DURATION_MS',
      PHASE_DURATIONS.DISTRIBUTION,
    );
  }

  async onModuleInit() {
    this.logger.log('Game service initialized, starting game loop...');
    // Give a small delay for WebSocket gateway to be ready
    setTimeout(() => this.startGameLoop(), 2000);
  }

  /**
   * Main game loop - runs continuously
   */
  private async startGameLoop() {
    this.logger.log('🎮 Game loop started!');

    while (true) {
      try {
        this.roundId++;
        this.logger.log(`📍 Starting round ${this.roundId}`);

        // Phase 1: Preparation
        await this.runPreparationPhase();

        // Phase 2: Resolution
        await this.runResolutionPhase();

        // Phase 3: Distribution
        await this.runDistributionPhase();

        // Reset for next round
        this.resetRound();
      } catch (error) {
        this.logger.error('Error in game loop:', error);
        // Wait a bit before retrying
        await this.sleep(5000);
      }
    }
  }

  /**
   * Preparation Phase - Users can place bets
   */
  private async runPreparationPhase() {
    this.currentPhase = GamePhase.PREPARATION;
    this.phaseEndsAt = Date.now() + this.preparationDuration;

    // Generate RNG commitment
    const rng = this.rngService.generateCommitment();
    this.commitment = rng.commitment;
    this.seed = rng.seed;

    this.logger.log(`⏳ Preparation phase started (Round ${this.roundId})`);
    this.logger.log(`🔐 RNG Commitment: ${this.commitment.substring(0, 16)}...`);

    // Broadcast phase change
    this.gateway.broadcastPhaseChange({
      phase: GamePhase.PREPARATION,
      roundId: this.roundId,
      endsAt: this.phaseEndsAt,
      commitment: this.commitment,
    });

    // Initialize betting pools for this round
    await this.bettingService.initializeRound(this.roundId);

    // Wait for phase to end
    await this.sleep(this.preparationDuration);
  }

  /**
   * Resolution Phase - Race animation plays
   */
  private async runResolutionPhase() {
    this.currentPhase = GamePhase.RESOLUTION;
    this.phaseEndsAt = Date.now() + this.resolutionDuration;

    // Determine winner using RNG
    this.winner = this.rngService.determineWinner(this.seed!, SPERM_COUNT);

    this.logger.log(`🏁 Resolution phase started (Round ${this.roundId})`);
    this.logger.log(`🎲 Winner: Sperm #${this.winner} (Seed: ${this.seed!.substring(0, 16)}...)`);

    // Broadcast race start
    this.gateway.broadcastRaceStart({
      roundId: this.roundId,
      winner: this.winner,
      seed: this.seed!,
      endsAt: this.phaseEndsAt,
    });

    // Stream race positions for animation
    await this.streamRaceAnimation();
  }

  /**
   * Distribution Phase - Payouts are distributed
   */
  private async runDistributionPhase() {
    this.currentPhase = GamePhase.DISTRIBUTION;
    this.phaseEndsAt = Date.now() + this.distributionDuration;

    this.logger.log(`💰 Distribution phase started (Round ${this.roundId})`);

    // Calculate and store payouts
    const result = await this.bettingService.calculateDistribution(
      this.roundId,
      this.winner!,
      HOUSE_FEE_PERCENT,
    );

    // Broadcast results
    this.gateway.broadcastDistribution({
      roundId: this.roundId,
      result: {
        roundId: this.roundId,
        winnerSpermId: this.winner!,
        totalPool: result.totalPool,
        houseFee: result.houseFee,
        netPool: result.netPool,
        finalRanking: result.finalRanking,
        seed: this.seed!,
        commitment: this.commitment!,
      },
      winners: result.winners,
    });

    // Wait for phase to end
    await this.sleep(this.distributionDuration);
  }

  /**
   * Stream race positions for animation
   */
  private async streamRaceAnimation() {
    const totalFrames = Math.floor((this.resolutionDuration / 1000) * RACE_FPS);
    const frameDelay = 1000 / RACE_FPS;

    // Generate all positions deterministically
    const allPositions = this.rngService.generateRaceAnimation(
      this.seed!,
      SPERM_COUNT,
      this.winner!,
      totalFrames,
    );

    for (let frame = 0; frame < totalFrames; frame++) {
      this.positions = allPositions[frame];

      this.gateway.broadcastPositions({
        positions: this.positions,
        frame,
        totalFrames,
      });

      await this.sleep(frameDelay);
    }

    // Ensure final positions show winner at 100
    this.positions = allPositions[totalFrames - 1];
  }

  /**
   * Reset state for new round
   */
  private resetRound() {
    this.commitment = null;
    this.seed = null;
    this.winner = null;
    this.positions = Array(SPERM_COUNT).fill(0);
  }

  /**
   * Get current game state (for new connections)
   */
  getCurrentState(): RoundState {
    return {
      roundId: this.roundId,
      phase: this.currentPhase,
      phaseEndsAt: this.phaseEndsAt,
      pools: this.bettingService.getPools(this.roundId),
      totalPool: this.bettingService.getTotalPool(this.roundId),
      commitment: this.commitment || undefined,
      seed: this.currentPhase !== GamePhase.PREPARATION ? this.seed || undefined : undefined,
      winner: this.winner || undefined,
      positions: this.positions,
    };
  }

  /**
   * Check if we're in betting phase and can accept bets
   */
  canAcceptBets(): boolean {
    if (this.currentPhase !== GamePhase.PREPARATION) {
      return false;
    }
    // Don't accept bets in last 5 seconds
    const timeLeft = this.phaseEndsAt - Date.now();
    return timeLeft > 5000;
  }

  /**
   * Get current round ID
   */
  getCurrentRoundId(): number {
    return this.roundId;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
