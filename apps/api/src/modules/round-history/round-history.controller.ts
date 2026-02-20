import { Controller, Get, Query } from '@nestjs/common';
import { RoundHistoryService } from './round-history.service';

@Controller('round-history')
export class RoundHistoryController {
  constructor(private readonly roundHistoryService: RoundHistoryService) {}

  /**
   * Fetch winner of previous resolved rounds with skip/limit pagination.
   * Returns: winner_sperm_id, total_pot, total_user, user_pots,
   * timestamp, tx_hash, user_winnings (null if no winning or no bet).
   */
  @Get('winners')
  async getPreviousRoundWinners(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    const skipNum = skip != null ? Math.max(0, parseInt(skip, 10) || 0) : 0;
    const limitNum =
      limit != null ? Math.min(100, Math.max(1, parseInt(limit, 10) || 10)) : 10;
    return this.roundHistoryService.getPreviousRoundWinners(skipNum, limitNum);
  }
}
