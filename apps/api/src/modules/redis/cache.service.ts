import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Generalized Redis-backed cache service for JSON-serializable values.
 * Use for frequently-called read paths that can tolerate stale data (via TTL).
 *
 * @example
 *   const stats = await this.cacheService.getOrSet(
 *     `user:stats:${address}`,
 *     300,
 *     () => this.fetchStatsFromDb(address),
 *   );
 */
@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Get a cached value by key. Returns null on miss or parse error.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = this.redisService.getClient();
      const raw = await redis.get(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set a value in cache with TTL. Value must be JSON-serializable.
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const redis = this.redisService.getClient();
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      /* Non-fatal: cache write failure should not block the response */
    }
  }

  /**
   * Get from cache or compute via factory, then cache the result.
   * Efficient cache-aside: single method for the common "check cache → compute → store" flow.
   *
   * @param key Cache key
   * @param ttlSeconds TTL in seconds
   * @param factory Async function to compute value on cache miss
   * @returns Cached or freshly computed value
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete a cached value. Useful for invalidation on writes.
   */
  async del(key: string): Promise<void> {
    try {
      const redis = this.redisService.getClient();
      await redis.del(key);
    } catch {
      /* Non-fatal */
    }
  }
}
