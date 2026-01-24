import { Module } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { ContractClientService } from './contract-client.service';

@Module({
  providers: [SolanaService, ContractClientService],
  exports: [SolanaService, ContractClientService],
})
export class SolanaModule {}
