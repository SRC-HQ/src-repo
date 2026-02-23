import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { BetHistory } from '@/entities/bet-history.entity';
import { DistributionHistory } from '@/entities/distribution-history.entity';
import { CacheService } from '../redis/cache.service';
import { userStatsKey, USER_STATS_CACHE_TTL } from '../redis/redis.constants';

export interface UserStats {
  total_races: number;
  total_winning: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(BetHistory)
    private readonly betHistoryRepo: Repository<BetHistory>,
    @InjectRepository(DistributionHistory)
    private readonly distributionHistoryRepo: Repository<DistributionHistory>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Ensure a user profile exists for the given address.
   * If it already exists, returns the existing row; otherwise creates a new one.
   */
  async ensureUser(address: string): Promise<User> {
    const normalized = address.trim();
    let user = await this.userRepo.findOne({ where: { user_address: normalized } });
    if (!user) {
      user = this.userRepo.create({
        user_address: normalized,
        username: null,
        image: null,
        x_id: null,
        x_username: null,
      });
      user = await this.userRepo.save(user);
    }
    return user;
  }

  /**
   * Fetch a user profile by wallet address.
   */
  async getByAddress(address: string): Promise<User | null> {
    const normalized = address.trim();
    return this.userRepo.findOne({ where: { user_address: normalized } });
  }

  /**
   * Fetch user stats: total races participated and total winnings (lamports).
   * Optimized: Redis cache (5min TTL) + single DB round-trip with parallel queries.
   */
  async getStats(address: string): Promise<UserStats> {
    const normalized = address.trim();
    return this.cacheService.getOrSet(
      userStatsKey(normalized),
      USER_STATS_CACHE_TTL,
      async () => this.fetchStatsFromDb(normalized),
    );
  }

  private async fetchStatsFromDb(address: string): Promise<UserStats> {
    const [totalRacesResult, totalWinningResult] = await Promise.all([
      this.betHistoryRepo
        .createQueryBuilder('b')
        .select('COUNT(DISTINCT b.round_id)', 'count')
        .where('b.user_address = :address', { address })
        .getRawOne<{ count: string }>(),
      this.distributionHistoryRepo
        .createQueryBuilder('d')
        .select('COALESCE(SUM(CAST(d.winning_amount AS DECIMAL)), 0)', 'total')
        .where('d.user_address = :address', { address })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      total_races: parseInt(totalRacesResult?.count ?? '0', 10) || 0,
      total_winning: totalWinningResult?.total ?? '0',
    };
  }
}

