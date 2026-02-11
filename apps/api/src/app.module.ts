import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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
