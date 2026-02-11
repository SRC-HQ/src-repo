import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Global Redis module.
 *
 * Provides RedisService across the entire application without requiring
 * explicit imports in each feature module.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
