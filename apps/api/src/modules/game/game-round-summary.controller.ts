import { Controller, Get, Param } from '@nestjs/common';
import { GameRoundSummaryService } from './game-round-summary.service';

@Controller('game')
export class GameRoundSummaryController {
  constructor(private readonly gameRoundSummaryService: GameRoundSummaryService) {}

  /**
   * Get general round-specific summary:
   * - total round pot
   * - total user per sperm
   * - total bet per sperm
   */
  @Get('round/:roundId/summary')
  async getRoundGeneralSummary(@Param('roundId') roundIdParam: string) {
    const roundId = Number(roundIdParam);
    return this.gameRoundSummaryService.getRoundGeneralSummary(roundId);
  }

  /**
   * Get user-specific summary for a round:
   * - total amount the user bet in that round
   * - which sperms the user bet on and how much
   */
  @Get('round/:roundId/user-summary/:walletAddress')
  async getRoundUserSummary(
    @Param('roundId') roundIdParam: string,
    @Param('walletAddress') walletAddress: string,
  ) {
    const roundId = Number(roundIdParam);
    return this.gameRoundSummaryService.getRoundUserSummary(roundId, walletAddress);
  }
}

