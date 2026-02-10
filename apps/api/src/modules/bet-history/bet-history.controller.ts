import { Controller, Get, Param } from '@nestjs/common';
import { BetHistoryService } from './bet-history.service';

@Controller('bet-history')
export class BetHistoryController {
  constructor(private readonly betHistoryService: BetHistoryService) {}

  /**
   * List all bets for which the PDA rent has not yet been reclaimed by this user.
   * Aggregated by (roundId, spermId). Used by frontend to power the "Bet Cashback" UI.
   */
  @Get('unclaimed-rent/:walletAddress')
  async getUnclaimedRentBets(@Param('walletAddress') walletAddress: string) {
    const bets = await this.betHistoryService.getUnclaimedRentBetsForUser(walletAddress);
    return {
      walletAddress,
      bets,
    };
  }
}

