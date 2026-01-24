import { Injectable, Logger } from '@nestjs/common';
import {
  Bet,
  BetStatus,
  CreateBetDto,
  PoolState,
  WinnerPayout,
  SPERM_COUNT,
} from '../../common';
import { SolanaService } from '../solana/solana.service';
import { v4 as uuidv4 } from 'uuid';

interface RoundData {
  pools: PoolState[];
  bets: Map<string, Bet>;
  totalPool: number;
}

@Injectable()
export class BettingService {
  private readonly logger = new Logger(BettingService.name);

  // In-memory storage (replace with database in production)
  private rounds: Map<number, RoundData> = new Map();

  constructor(private readonly solanaService: SolanaService) {}

  /**
   * Initialize a new round
   */
  initializeRound(roundId: number): void {
    const pools: PoolState[] = Array(SPERM_COUNT)
      .fill(null)
      .map((_, i) => ({
        spermId: i,
        totalBets: 0,
        bettorCount: 0,
        odds: 1,
      }));

    this.rounds.set(roundId, {
      pools,
      bets: new Map(),
      totalPool: 0,
    });

    this.logger.log(`Round ${roundId} initialized with ${SPERM_COUNT} pools`);
  }

  /**
   * Place a bet
   */
  async placeBet(dto: CreateBetDto): Promise<{
    betId: string;
    spermId: number;
    pools: PoolState[];
  }> {
    const round = this.rounds.get(dto.roundId);
    if (!round) {
      throw new Error('Round not found');
    }

    // Validate sperm ID
    if (dto.spermId < 0 || dto.spermId >= SPERM_COUNT) {
      throw new Error('Invalid sperm ID');
    }

    // Verify transaction on-chain
    // const isValid = await this.solanaService.verifyBetTransaction(
    //   dto.txSignature,
    //   dto.walletAddress,
    //   dto.amount,
    // );

    // if (!isValid) {
    //   throw new Error('Invalid transaction');
    // }

    // Check for duplicate transaction
    const existingBet = Array.from(round.bets.values()).find(
      (b) => b.depositTxSignature === dto.txSignature,
    );
    if (existingBet) {
      throw new Error('Duplicate transaction');
    }

    // Create bet record
    const bet: Bet = {
      id: uuidv4(),
      roundId: dto.roundId,
      walletAddress: dto.walletAddress,
      spermId: dto.spermId,
      amount: dto.amount,
      depositTxSignature: dto.txSignature,
      status: BetStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store bet
    round.bets.set(bet.id, bet);

    // Update pool
    const pool = round.pools[dto.spermId];
    pool.totalBets += dto.amount;
    pool.bettorCount += 1;
    round.totalPool += dto.amount;

    // Recalculate odds
    this.recalculateOdds(round);

    this.logger.log(
      `Bet placed: ${dto.amount} lamports on Sperm #${dto.spermId} by ${dto.walletAddress.substring(0, 8)}...`,
    );

    return {
      betId: bet.id,
      spermId: dto.spermId,
      pools: round.pools,
    };
  }

  /**
   * Get pools for a round
   */
  getPools(roundId: number): PoolState[] {
    const round = this.rounds.get(roundId);
    return round?.pools || [];
  }

  /**
   * Get total pool for a round
   */
  getTotalPool(roundId: number): number {
    const round = this.rounds.get(roundId);
    return round?.totalPool || 0;
  }

  /**
   * Calculate distribution after round ends
   */
  async calculateDistribution(
    roundId: number,
    winnerId: number,
    houseFeePercent: number,
  ): Promise<{
    totalPool: number;
    houseFee: number;
    netPool: number;
    winners: WinnerPayout[];
    finalRanking: number[];
  }> {
    const round = this.rounds.get(roundId);
    if (!round) {
      throw new Error('Round not found');
    }

    const totalPool = round.totalPool;
    const houseFee = Math.floor((totalPool * houseFeePercent) / 100);
    const netPool = totalPool - houseFee;

    // Get all bets on winning sperm
    const winningBets = Array.from(round.bets.values()).filter(
      (bet) => bet.spermId === winnerId,
    );

    const totalWinningBets = winningBets.reduce((sum, bet) => sum + bet.amount, 0);

    // Calculate payouts
    const winners: WinnerPayout[] = winningBets.map((bet) => {
      const payout =
        totalWinningBets > 0
          ? Math.floor((bet.amount / totalWinningBets) * netPool)
          : 0;

      // Update bet record
      bet.payoutAmount = payout;
      bet.status = BetStatus.WON;
      bet.updatedAt = new Date();

      return {
        walletAddress: bet.walletAddress,
        betAmount: bet.amount,
        payoutAmount: payout,
        profit: payout - bet.amount,
      };
    });

    // Mark losing bets
    Array.from(round.bets.values())
      .filter((bet) => bet.spermId !== winnerId)
      .forEach((bet) => {
        bet.status = BetStatus.LOST;
        bet.payoutAmount = 0;
        bet.updatedAt = new Date();
      });

    // Generate final ranking (winner first, then random based on pool size)
    const finalRanking = this.generateFinalRanking(round.pools, winnerId);

    this.logger.log(
      `Distribution calculated: ${winners.length} winners, ${netPool} lamports net pool`,
    );

    return {
      totalPool,
      houseFee,
      netPool,
      winners,
      finalRanking,
    };
  }

  /**
   * Recalculate odds for all pools
   */
  private recalculateOdds(round: RoundData): void {
    const houseFee = 0.15; // 15%
    const netPool = round.totalPool * (1 - houseFee);

    round.pools.forEach((pool) => {
      if (pool.totalBets > 0) {
        pool.odds = Math.round((netPool / pool.totalBets) * 100) / 100;
      } else {
        pool.odds = 0;
      }
    });
  }

  /**
   * Generate final ranking for display
   */
  private generateFinalRanking(pools: PoolState[], winnerId: number): number[] {
    // Sort pools by total bets (descending), but winner always first
    const sorted = [...pools].sort((a, b) => {
      if (a.spermId === winnerId) return -1;
      if (b.spermId === winnerId) return 1;
      return b.totalBets - a.totalBets;
    });

    return sorted.map((p) => p.spermId);
  }

  /**
   * Get bets for a specific wallet in a round
   */
  getBetsByWallet(roundId: number, walletAddress: string): Bet[] {
    const round = this.rounds.get(roundId);
    if (!round) return [];

    return Array.from(round.bets.values()).filter(
      (bet) => bet.walletAddress === walletAddress,
    );
  }

  /**
   * Get all bets in a round
   */
  getAllBets(roundId: number): Bet[] {
    const round = this.rounds.get(roundId);
    if (!round) return [];

    return Array.from(round.bets.values());
  }
}
