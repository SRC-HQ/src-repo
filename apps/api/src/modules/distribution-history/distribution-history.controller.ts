import { Controller, Get, Param } from '@nestjs/common';
import { DistributionHistoryService } from './distribution-history.service';

@Controller('distribution-history')
export class DistributionHistoryController {
  constructor(private readonly distributionHistoryService: DistributionHistoryService) {}

  /**
   * Top 10 biggest winnings of all time by user address.
   * Cached (5 min TTL) — data changes infrequently.
   */
  @Get('leaderboard')
  async getTopWinningsLeaderboard() {
    return this.distributionHistoryService.getTopWinningsLeaderboard();
  }

  /**
   * List all unclaimed winning distribution records for a user address.
   * Returns array of records + aggregated total winning amount.
   */
  @Get('unclaimed/:walletAddress')
  async getUnclaimedDistributions(@Param('walletAddress') walletAddress: string) {
    return this.distributionHistoryService.getUnclaimedByUser(walletAddress);
  }
}
