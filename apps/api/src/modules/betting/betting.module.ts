import { Module } from '@nestjs/common';
import { BettingService } from './betting.service';
import { BettingController } from './betting.controller';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [SolanaModule],
  providers: [BettingService],
  controllers: [BettingController],
  exports: [BettingService],
})
export class BettingModule {}
