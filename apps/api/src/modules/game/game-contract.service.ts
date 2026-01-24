import { ConsoleLogger, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BN } from '@coral-xyz/anchor';
import { SolanaService } from '../solana/solana.service';
import { RngService } from '../rng/rng.service';
import { GameGateway } from './game.gateway';
import { PHASE_DURATIONS, SPERM_COUNT } from '../../common';
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

  // Phase durations
  private preparationDuration: number;
  private resolutionDuration: number;
  private distributionDuration: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly solanaService: SolanaService,
    private readonly rngService: RngService,
    private readonly gateway: GameGateway,
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

        this.logger.log('Initializing game on-chain...');
        await this.retryTransaction(
          () => contractClient.initializeGame(programId, authorityWallet.publicKey),
          'initializeGame',
        );
        this.logger.log('Game initialized successfully');
      } else {
        this.logger.log(`Game already initialized. Current round: ${globalState.currentRound.toString()}`);
        this.currentRoundId = globalState.currentRound.toNumber();
      }
    } catch (error: any) {
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
   * Preparation Phase - Start round on-chain, allow betting
   */
  private async runPreparationPhase(roundId: number): Promise<void> {
    this.logger.log(`⏳ Preparation phase started (Round ${roundId})`);

    // Generate server seed and hash
    this.currentServerSeed = crypto.randomBytes(32);
    const hasher = crypto.createHash('sha256');
    hasher.update(this.currentServerSeed);
    const hashBuffer = hasher.digest();
    this.currentHashedSeed = Array.from(hashBuffer);

    this.logger.log(`🔐 Generated hashed seed: ${Buffer.from(hashBuffer).toString('hex').substring(0, 16)}...`);

    // Start round on-chain
    const authorityWallet = this.solanaService.getAuthorityWallet();
    if (!authorityWallet) {
      throw new Error('Authority wallet not available');
    }

    const contractClient = this.solanaService.getContractClient();
    const programId = this.solanaService.getProgramId();
    await this.retryTransaction(
      () => contractClient.startRound(
        programId,
        authorityWallet.publicKey,
        this.currentHashedSeed!,
        new BN(roundId),
      ),
      'startRound',
    );

    this.logger.log(`✅ Round ${roundId} started on-chain`);

    // Broadcast phase change to frontend
    const phaseEndsAt = Date.now() + this.preparationDuration;
    this.gateway.broadcastPhaseChange({
      phase: 'preparation' as any,
      roundId,
      endsAt: phaseEndsAt,
      commitment: Buffer.from(hashBuffer).toString('hex'),
    });

    // Wait for phase to end
    await this.sleep(this.preparationDuration);
  }

  /**
   * Resolution Phase - Lock betting, determine winner, resolve on-chain
   */
  private async runResolutionPhase(roundId: number): Promise<void> {
    this.logger.log(`🏁 Resolution phase started (Round ${roundId})`);

    const authorityWallet = this.solanaService.getAuthorityWallet();
    if (!authorityWallet) {
      throw new Error('Authority wallet not available');
    }

    const contractClient = this.solanaService.getContractClient();
    const programId = this.solanaService.getProgramId();

    // Lock betting
    await this.retryTransaction(
      () => contractClient.lockBetting(programId, authorityWallet.publicKey, new BN(roundId)),
      'lockBetting',
    );
    this.logger.log(`🔒 Betting locked for round ${roundId}`);

    // Determine winner using RNG
    const seedHex = this.currentServerSeed!.toString('hex');
    const winnerId = this.rngService.determineWinner(seedHex, SPERM_COUNT);

    this.logger.log(`🎲 Winner determined: Sperm #${winnerId}`);

    // Broadcast race start to frontend
    const phaseEndsAt = Date.now() + this.resolutionDuration;
    this.gateway.broadcastRaceStart({
      roundId,
      winner: winnerId,
      seed: seedHex,
      endsAt: phaseEndsAt,
    });

    // Stream race animation
    await this.streamRaceAnimation(seedHex, winnerId);

    // Resolve round on-chain (while animation is playing)
    const serverSeedArray = Array.from(this.currentServerSeed!);
    await this.retryTransaction(
      () => contractClient.resolveRound(
        programId,
        authorityWallet.publicKey,
        new BN(roundId),
        winnerId,
        serverSeedArray,
      ),
      'resolveRound',
    );
    this.logger.log(`✅ Round ${roundId} resolved on-chain: Winner is sperm #${winnerId}`);

    // Wait for remaining time
    const elapsed = Date.now() - (phaseEndsAt - this.resolutionDuration);
    if (elapsed < this.resolutionDuration) {
      await this.sleep(this.resolutionDuration - elapsed);
    }
  }

  /**
   * Distribution Phase - Allow users to claim winnings
   */
  private async runDistributionPhase(roundId: number): Promise<void> {
    this.logger.log(`💰 Distribution phase started (Round ${roundId})`);

    // Fetch round account to get winner and pot info
    const contractClient = this.solanaService.getContractClient();
    const programId = this.solanaService.getProgramId();
    const roundAccount = await contractClient.fetchRoundAccount(programId, new BN(roundId));

    if (roundAccount) {
      const winnerId = roundAccount.winnerId;
      const totalPot = roundAccount.totalPot.toString();
      
      this.logger.log(`Round ${roundId} - Winner: #${winnerId}, Total Pot: ${totalPot} lamports`);

      // Broadcast distribution phase to frontend
      const phaseEndsAt = Date.now() + this.distributionDuration;
      this.gateway.broadcastDistribution({
        roundId,
        result: {
          roundId,
          winnerSpermId: winnerId,
          totalPool: Number(totalPot),
          houseFee: Math.floor(Number(totalPot) * 0.15),
          netPool: Math.floor(Number(totalPot) * 0.85),
          finalRanking: [], // Would need to calculate from positions
          seed: this.currentServerSeed!.toString('hex'),
          commitment: Buffer.from(this.currentHashedSeed!).toString('hex'),
        },
        winners: [], // Would need to fetch from chain
      });
    }

    // Wait for phase to end
    await this.sleep(this.distributionDuration);

    // Cleanup
    this.currentServerSeed = null;
    this.currentHashedSeed = null;
  }

  /**
   * Stream race positions for animation
   */
  private async streamRaceAnimation(seed: string, winner: number): Promise<void> {
    const totalFrames = Math.floor((this.resolutionDuration / 1000) * 30); // 30 FPS
    const frameDelay = 1000 / 30;

    const allPositions = this.rngService.generateRaceAnimation(
      seed,
      SPERM_COUNT,
      winner,
      totalFrames,
    );

    for (let frame = 0; frame < totalFrames; frame++) {
      const positions = allPositions[frame];
      this.gateway.broadcastPositions({
        positions,
        frame,
        totalFrames,
      });
      await this.sleep(frameDelay);
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
        this.logger.log(`✅ ${operation} succeeded`);
        return result;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `❌ ${operation} failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
        );
        if (attempt < maxRetries) {
          await this.sleep(1000 * attempt); // Exponential backoff
        }
      }
    }

    throw new Error(
      `${operation} failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Get current round ID
   */
  getCurrentRoundId(): number {
    return this.currentRoundId;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
