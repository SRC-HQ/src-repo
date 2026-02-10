import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import { BorshEventCoder, EventParser, Idl } from '@coral-xyz/anchor';
import * as IDL from '@sperm-race/contract-types/idl';
import { BetHistory } from '../../entities/bet-history.entity';
import { IndexedBet } from '@/common';
import { RawInstructionPayload } from '@/common/types/indexing';

/** Decoded PlaceBetEvent from chain (Anchor BN/PublicKey). */
interface PlaceBetEventData {
  user: { toBase58: () => string };
  round_id: { toNumber: () => number };
  sperm_id: number;
  amount: { toString: () => string };
}

/** Decoded RentClaimedEvent from chain (Anchor BN/PublicKey). */
interface RentClaimedEventData {
  round_id: { toNumber: () => number } | number;
  user: { toBase58: () => string } | string;
  sperm_id: { toNumber: () => number } | number;
  amount: { toString: () => string } | number | string;
}

@Injectable()
export class BetHistoryService {
  private readonly logger = new Logger(BetHistoryService.name);
  private readonly eventParser: EventParser | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BetHistory)
    private readonly betHistoryRepo: Repository<BetHistory>,
  ) {
    const programId = this.configService.get<string>('PROGRAM_ID');
    if (programId) {
      const eventCoder = new BorshEventCoder(IDL as Idl);
      // @ts-expect-error - runtime shape compatible with EventParser
      this.eventParser = new EventParser(new PublicKey(programId), { events: eventCoder });
    }
  }

  /**
   * Called by indexer when instruction is PlaceBet. Parses logs and records bet.
   */
  async handleInstruction(payload: RawInstructionPayload): Promise<void> {
    const events = this.eventParser?.parseLogs(payload.logs) ?? [];
    for (const evt of events) {
      if (evt.name === 'PlaceBetEvent') {
        const data = evt.data as PlaceBetEventData;
        if (!data?.user || data.round_id == null || data.sperm_id == null || data.amount == null)
          continue;

        const bet: IndexedBet = {
          userAddress:
            typeof data.user?.toBase58 === 'function' ? data.user.toBase58() : String(data.user),
          roundId:
            typeof data.round_id?.toNumber === 'function'
              ? data.round_id.toNumber()
              : Number(data.round_id),
          spermId: Number(data.sperm_id),
          amount:
            typeof data.amount?.toString === 'function'
              ? data.amount.toString()
              : String(data.amount),
          txHash: payload.signature,
          slot: payload.slot,
          blockTime: payload.blockTime,
        };

        await this.recordBet(bet);
        // Do not break: a single transaction can contain multiple PlaceBet calls.
        continue;
      }

      if (evt.name === 'RentClaimedEvent') {
        const data = evt.data as RentClaimedEventData;
        if (data?.round_id == null || data?.user == null || data?.sperm_id == null) continue;

        const roundId =
          typeof data.round_id === 'number'
            ? data.round_id
            : (data.round_id as { toNumber: () => number }).toNumber();
        const userAddress =
          typeof (data.user as any)?.toBase58 === 'function'
            ? (data.user as any).toBase58()
            : String(data.user);
        const spermId =
          typeof data.sperm_id === 'number'
            ? data.sperm_id
            : (data.sperm_id as { toNumber: () => number }).toNumber();

        await this.markRentClaimed(String(roundId), userAddress, spermId, payload.signature);
        // One RentClaimedEvent per tx.
        continue;
      }
    }
  }

  /** Insert a bet into bet_history. Idempotent: unique on (tx_hash, user_address, round_id, sperm_id). */
  async recordBet(bet: IndexedBet): Promise<void> {
    try {
      await this.betHistoryRepo.save(
        this.betHistoryRepo.create({
          user_address: bet.userAddress,
          round_id: String(bet.roundId),
          sperm_id: bet.spermId,
          amount: bet.amount,
          tx_hash: bet.txHash,
          slot: bet.slot != null ? String(bet.slot) : null,
          timestamp: bet.blockTime != null ? new Date(bet.blockTime * 1000) : null,
        }),
      );
      this.logger.log(
        `Bet recorded: tx=${bet.txHash} user=${bet.userAddress} round=${bet.roundId} sperm=${bet.spermId} amount=${bet.amount} lamports`,
      );
    } catch (err: any) {
      if (err?.code === '23505') {
        this.logger.debug(`Bet already recorded (duplicate): ${bet.txHash}`);
        return;
      }
      this.logger.error(`Failed to record bet: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  /**
   * Mark all bet_history rows for (round_id, user_address, sperm_id) as having
   * their rent reclaimed. We don't care which exact PlaceBet tx funded the PDA,
   * so we update all matching rows where rent_claim_tx_hash IS NULL.
   */
  async markRentClaimed(
    roundId: string,
    userAddress: string,
    spermId: number,
    rentClaimTxHash: string,
  ): Promise<void> {
    try {
      const result = await this.betHistoryRepo
        .createQueryBuilder()
        .update(BetHistory)
        .set({ rent_claim_tx_hash: rentClaimTxHash })
        .where('round_id = :roundId', { roundId })
        .andWhere('user_address = :userAddress', { userAddress })
        .andWhere('sperm_id = :spermId', { spermId })
        .andWhere('rent_claim_tx_hash IS NULL')
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `Rent claimed: round_id=${roundId} user=${userAddress} sperm_id=${spermId} tx=${rentClaimTxHash} rows_updated=${result.affected}`,
        );
      } else {
        this.logger.warn(
          `Rent claim event but no matching bet_history rows: round_id=${roundId} user=${userAddress} sperm_id=${spermId}`,
        );
      }
    } catch (err: any) {
      this.logger.error(`Failed to mark rent claimed: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  /**
   * List aggregated bets for which rent has not yet been reclaimed by a user.
   * Aggregated by (round_id, sperm_id).
   */
  async getUnclaimedRentBetsForUser(userAddress: string): Promise<
    { roundId: number; spermId: number; totalAmount: string }[]
  > {
    const rows = await this.betHistoryRepo
      .createQueryBuilder('bet')
      .select('bet.round_id', 'round_id')
      .addSelect('bet.sperm_id', 'sperm_id')
      .addSelect('SUM(CAST(bet.amount AS DECIMAL))', 'total_amount')
      .where('bet.user_address = :userAddress', { userAddress })
      .andWhere('bet.rent_claim_tx_hash IS NULL')
      .groupBy('bet.round_id')
      .addGroupBy('bet.sperm_id')
      .orderBy('bet.round_id', 'DESC')
      .getRawMany<{ round_id: string; sperm_id: number; total_amount: string }>();

    return rows.map((row) => ({
      roundId: Number(row.round_id),
      spermId: Number(row.sperm_id),
      totalAmount: row.total_amount,
    }));
  }
}
