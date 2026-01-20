import { Controller, Get, Param, Query } from '@nestjs/common';
import { BettingService } from './betting.service';

@Controller('betting')
export class BettingController {
  constructor(private readonly bettingService: BettingService) {}

  /**
   * Get pools for a round
   */
  @Get('pools/:roundId')
  getPools(@Param('roundId') roundId: string) {
    return this.bettingService.getPools(parseInt(roundId, 10));
  }

  /**
   * Get bets for a wallet in a round
   */
  @Get('bets/:roundId')
  getBets(
    @Param('roundId') roundId: string,
    @Query('wallet') wallet: string,
  ) {
    if (wallet) {
      return this.bettingService.getBetsByWallet(parseInt(roundId, 10), wallet);
    }
    return this.bettingService.getAllBets(parseInt(roundId, 10));
  }
}
