import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionHistory } from '@/entities/distribution-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';
import { IndexedRoundResolution } from '@/common';

export interface LeaderboardEntry {
  rank: number;
  user_address: string;
  total_winning_amount: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

export interface UnclaimedDistributionRecord {
  id: string;
  round_id: string;
  winning_sperm_id: number;
  bet_amount: string;
  winning_amount: string;
  created_at: string;
}

export interface UnclaimedDistributionsResponse {
  walletAddress: string;
  records: UnclaimedDistributionRecord[];
  totalWinningAmount: string;
}

@Injectable()
export class DistributionHistoryService {
  private readonly logger = new Logger(DistributionHistoryService.name);

  constructor(
    @InjectRepository(DistributionHistory)
    private readonly distributionHistoryRepo: Repository<DistributionHistory>,
    @InjectRepository(BetHistory)
    private readonly betHistoryRepo: Repository<BetHistory>,
  ) {}

  /**
   * Top 10 biggest winnings of all time by user address.
   */
  async getTopWinningsLeaderboard(): Promise<LeaderboardResponse> {
    const rows = await this.distributionHistoryRepo
      .createQueryBuilder('d')
      .select('d.user_address', 'user_address')
      .addSelect('SUM(CAST(d.winning_amount AS DECIMAL))', 'total_winning_amount')
      .groupBy('d.user_address')
      .orderBy('total_winning_amount', 'DESC')
      .limit(10)
      .getRawMany<{ user_address: string; total_winning_amount: string }>();

    const entries: LeaderboardEntry[] = rows.map((r, i) => ({
      rank: i + 1,
      user_address: r.user_address,
      total_winning_amount: r.total_winning_amount,
    }));

    return { entries };
  }

  /**
   * List all unclaimed distribution records for a user (claim_tx_hash IS NULL).
   * Returns records and aggregated winning amount.
   */
  async getUnclaimedByUser(walletAddress: string): Promise<UnclaimedDistributionsResponse> {
    const normalized = walletAddress.trim();
    const rows = await this.distributionHistoryRepo
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.round_id',
        'd.winning_sperm_id',
        'd.bet_amount',
        'd.winning_amount',
        'd.created_at',
      ])
      .where('d.user_address = :walletAddress', { walletAddress: normalized })
      .andWhere('d.claim_tx_hash IS NULL')
      .orderBy('d.round_id', 'DESC')
      .addOrderBy('d.winning_sperm_id', 'ASC')
      .getMany();

    const totalWinningAmount = rows.reduce<bigint>(
      (sum, r) => sum + BigInt(r.winning_amount),
      0n,
    );

    return {
      walletAddress: normalized,
      records: rows.map((r) => ({
        id: r.id,
        round_id: r.round_id,
        winning_sperm_id: r.winning_sperm_id,
        bet_amount: r.bet_amount,
        winning_amount: r.winning_amount,
        created_at: r.created_at?.toISOString?.() ?? '',
      })),
      totalWinningAmount: totalWinningAmount.toString(),
    };
  }

  /**
   * Compute winning amount for a winner using the same formula as claim_winnings:
   * raw_user_share = (user_bet * total_pot) / total_bets_on_winner
   * house_fee = raw_user_share * 10 / 100, baby_king_tax = raw_user_share * 5 / 100
   * net_winnings = raw_user_share - house_fee - baby_king_tax
   * jackpot_share = (user_bet * baby_king_jackpot_snapshot) / total_bets_on_winner (if baby king hit)
   * total_to_user = net_winnings + jackpot_share
   */
  private computeWinningAmount(
    userBetLamports: bigint,
    totalBetsOnWinner: bigint,
    totalPot: bigint,
    isBabyKingHit: boolean,
    babyKingJackpotSnapshot: bigint,
  ): bigint {
    if (totalBetsOnWinner === 0n) return 0n;
    const rawUserShare = (userBetLamports * totalPot) / totalBetsOnWinner;
    const houseFee = (rawUserShare * 10n) / 100n;
    const babyKingTax = (rawUserShare * 5n) / 100n;
    const netWinnings = rawUserShare - houseFee - babyKingTax;
    let jackpotShare = 0n;
    if (isBabyKingHit && babyKingJackpotSnapshot > 0n) {
      jackpotShare = (userBetLamports * babyKingJackpotSnapshot) / totalBetsOnWinner;
    }
    return netWinnings + jackpotShare;
  }

  /**
   * Create distribution_history rows for all winners of the round (same payout as claim_winnings).
   * Called by indexer when ResolveRoundEvent is parsed.
   */
  async createDistributionHistoryFromResolution(
    resolution: IndexedRoundResolution,
  ): Promise<void> {
    const roundIdStr = String(resolution.roundId);
    const winnerId = resolution.winnerSpermId;

    const rows = await this.betHistoryRepo
      .createQueryBuilder('bet')
      .select('bet.user_address', 'user_address')
      .addSelect('SUM(CAST(bet.amount AS DECIMAL))', 'total_bet')
      .where('bet.round_id = :roundId', { roundId: roundIdStr })
      .andWhere('bet.sperm_id = :spermId', { spermId: winnerId })
      .groupBy('bet.user_address')
      .getRawMany<{ user_address: string; total_bet: string }>();

    if (rows.length === 0) {
      this.logger.warn(`No winners for round_id=${roundIdStr} winning_sperm_id=${winnerId}`);
      return;
    }

    const totalPot = BigInt(resolution.totalPot);
    const snapshot = BigInt(resolution.babyKingJackpotSnapshot);
    const totalBetsOnWinner = rows.reduce((sum, r) => sum + BigInt(r.total_bet), 0n);

    const toInsert: Partial<DistributionHistory>[] = rows.map((r) => {
      const userBet = BigInt(r.total_bet);
      const winningAmount = this.computeWinningAmount(
        userBet,
        totalBetsOnWinner,
        totalPot,
        resolution.isBabyKingHit,
        snapshot,
      );
      return {
        round_id: roundIdStr,
        winning_sperm_id: winnerId,
        user_address: r.user_address,
        bet_amount: r.total_bet,
        winning_amount: String(winningAmount),
        claim_tx_hash: null,
      };
    });

    try {
      await this.distributionHistoryRepo
        .createQueryBuilder()
        .insert()
        .into(DistributionHistory)
        .values(toInsert)
        .orIgnore()
        .execute();
      this.logger.log(
        `Distribution history created: round_id=${roundIdStr} winners=${toInsert.length}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to create distribution history: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  /**
   * Set claim_tx_hash on the distribution row when user claims winnings.
   * Called by indexer when ClaimWinningsEvent is parsed.
   */
  async markClaimed(
    roundId: string,
    userAddress: string,
    winningSpermId: number,
    claimTxHash: string,
  ): Promise<void> {
    const row = await this.distributionHistoryRepo.findOne({
      where: { round_id: roundId, user_address: userAddress, winning_sperm_id: winningSpermId },
    });
    if (!row) {
      this.logger.warn(
        `Distribution not found for claim: round_id=${roundId} user=${userAddress} sperm_id=${winningSpermId}`,
      );
      return;
    }
    row.claim_tx_hash = claimTxHash;
    await this.distributionHistoryRepo.save(row);
    this.logger.log(
      `Distribution claimed: round_id=${roundId} user=${userAddress} tx=${claimTxHash}`,
    );
  }
}
