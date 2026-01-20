import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GameModule } from './modules/game/game.module';
import { BettingModule } from './modules/betting/betting.module';
import { SolanaModule } from './modules/solana/solana.module';
import { RngModule } from './modules/rng/rng.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // Scheduling for game loop
    ScheduleModule.forRoot(),

    // Feature modules
    GameModule,
    BettingModule,
    SolanaModule,
    RngModule,
  ],
})
export class AppModule {}
