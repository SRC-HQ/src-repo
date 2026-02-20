import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from './modules/redis/redis.module';
import { GameModule } from './modules/game/game.module';
import { SocketModule } from './modules/socket/socket.module';
import { SolanaModule } from './modules/solana/solana.module';
import { RngModule } from './modules/rng/rng.module';
import { IndexingModule } from './modules/indexing/indexing.module';
import { BetHistoryModule } from './modules/bet-history/bet-history.module';
import { RoundHistoryModule } from './modules/round-history/round-history.module';
import { DistributionHistoryModule } from './modules/distribution-history/distribution-history.module';
import { UserModule } from './modules/user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DB_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development', // For prod, use migration
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        if (url) {
          return { redis: url };
        }
        return {
          redis: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
    }),
    RedisModule,
    GameModule,
    SocketModule,
    SolanaModule,
    RngModule,
    IndexingModule,
    BetHistoryModule,
    RoundHistoryModule,
    DistributionHistoryModule,
    UserModule,
  ],
})
export class AppModule {}
