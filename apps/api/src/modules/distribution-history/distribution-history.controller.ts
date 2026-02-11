import { Controller, Get, Param } from '@nestjs/common';
import { DistributionHistoryService } from './distribution-history.service';

@Controller('distribution-history')
export class DistributionHistoryController {
  constructor(private readonly distributionHistoryService: DistributionHistoryService) {}

  /**
   * List all unclaimed winning distribution records for a user address.
   * Returns array of records + aggregated total winning amount.
   */
  @Get('unclaimed/:walletAddress')
  async getUnclaimedDistributions(@Param('walletAddress') walletAddress: string) {
    return this.distributionHistoryService.getUnclaimedByUser(walletAddress);
  }
}
