import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import { BorshEventCoder, EventParser, Idl } from '@coral-xyz/anchor';
import * as IDL from '@sperm-race/contracts/idl';
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
      if (evt.name !== 'PlaceBetEvent') continue;

      const data = evt.data as PlaceBetEventData;
      if (!data?.user || data.round_id == null || data.sperm_id == null || data.amount == null) continue;

      const bet: IndexedBet = {
        userAddress: typeof data.user?.toBase58 === 'function' ? data.user.toBase58() : String(data.user),
        roundId: typeof data.round_id?.toNumber === 'function' ? data.round_id.toNumber() : Number(data.round_id),
        spermId: Number(data.sperm_id),
        amount: typeof data.amount?.toString === 'function' ? data.amount.toString() : String(data.amount),
        txHash: payload.signature,
        slot: payload.slot,
        blockTime: payload.blockTime,
      };

      await this.recordBet(bet);
      // Do not break: a single transaction can contain multiple PlaceBet calls.
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
}
