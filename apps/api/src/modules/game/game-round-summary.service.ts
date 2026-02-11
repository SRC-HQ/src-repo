import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundHistory } from '@/entities/round-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';

@Injectable()
export class GameRoundSummaryService {
  constructor(
    @InjectRepository(RoundHistory)
    private readonly roundHistoryRepo: Repository<RoundHistory>,
    @InjectRepository(BetHistory)
    private readonly betHistoryRepo: Repository<BetHistory>,
  ) {}

  /**
   * General round-specific summary:
   * - total round pot
   * - total user per sperm (unique addresses)
   * - total bet per sperm
   */
  async getRoundGeneralSummary(roundId: number) {
    const roundIdStr = String(roundId);

    // Load round core info (total pot, total_address, etc.).
    const round = await this.roundHistoryRepo.findOne({
      where: { round_id: roundIdStr },
    });

    // Per-sperm aggregate: total bet + unique address count.
    const spermRows = await this.betHistoryRepo
      .createQueryBuilder('bet')
      .select('bet.sperm_id', 'sperm_id')
      .addSelect('SUM(CAST(bet.amount AS DECIMAL))', 'total_bet')
      .addSelect('COUNT(DISTINCT bet.user_address)', 'unique_address_count')
      .where('bet.round_id = :roundId', { roundId: roundIdStr })
      .groupBy('bet.sperm_id')
      .orderBy('bet.sperm_id', 'ASC')
      .getRawMany<{ sperm_id: number; total_bet: string; unique_address_count: string }>();

    return {
      roundId,
      totalPot: round?.total_pot ?? '0',
      totalAddress: round?.total_address ?? 0,
      isBabyKingHit: round?.is_babyking_hit ?? false,
      sperms: spermRows.map((row) => ({
        spermId: Number(row.sperm_id),
        totalBet: row.total_bet,
        uniqueAddressCount: Number(row.unique_address_count),
      })),
    };
  }

  /**
   * User-specific round summary:
   * - total amount the user bet in the round
   * - list of sperms the user bet on with amounts
   *
   * Returns:
   * {
   *   roundId,
   *   walletAddress,
   *   total_bet: "200000",
   *   bets: [{ sperm_id: 1, amount: "10000" }, ...]
   * }
   */
  async getRoundUserSummary(roundId: number, walletAddress: string) {
    const roundIdStr = String(roundId);

    const rows = await this.betHistoryRepo
      .createQueryBuilder('bet')
      .select('bet.sperm_id', 'sperm_id')
      .addSelect('SUM(CAST(bet.amount AS DECIMAL))', 'amount')
      .where('bet.round_id = :roundId', { roundId: roundIdStr })
      .andWhere('bet.user_address = :walletAddress', { walletAddress })
      .groupBy('bet.sperm_id')
      .orderBy('bet.sperm_id', 'ASC')
      .getRawMany<{ sperm_id: number; amount: string }>();

    const totalBetBigInt = rows.reduce<bigint>((sum, row) => sum + BigInt(row.amount), 0n);

    return {
      roundId,
      walletAddress,
      total_bet: totalBetBigInt.toString(),
      bets: rows.map((row) => ({
        sperm_id: Number(row.sperm_id),
        amount: row.amount,
      })),
    };
  }
}

