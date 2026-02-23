import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';

/**
 * Global Redis module.
 *
 * Provides RedisService and CacheService across the entire application
 * without requiring explicit imports in each feature module.
 */
@Global()
@Module({
  providers: [RedisService, CacheService],
  exports: [RedisService, CacheService],
})
export class RedisModule {}
