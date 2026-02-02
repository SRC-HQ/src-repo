import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import { BorshEventCoder, EventParser, Idl } from '@coral-xyz/anchor';
import * as IDL from '@sperm-race/contracts/idl';
import { RoundHistory } from '@/entities/round-history.entity';
import { IndexedRoundStart } from '@/common';
import { RawInstructionPayload } from '@/common/types/indexing';

/** Decoded StartRoundEvent from chain (Anchor BN/PublicKey / bytes). */
interface StartRoundEventData {
  round_id: { toNumber: () => number } | number;
  hashed_seed: number[] | Uint8Array | Buffer;
  authority: { toBase58: () => string };
}

/** Convert 32-byte seed to hex string. */
function hashedSeedToString(seed: number[] | Uint8Array | Buffer): string {
  const arr = Array.isArray(seed) ? seed : Array.from(seed);
  return Buffer.from(arr).toString('hex');
}

@Injectable()
export class RoundHistoryService {
  private readonly logger = new Logger(RoundHistoryService.name);
  private readonly eventParser: EventParser | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RoundHistory)
    private readonly roundHistoryRepo: Repository<RoundHistory>,
  ) {
    const programId = this.configService.get<string>('PROGRAM_ID');
    if (programId) {
      const eventCoder = new BorshEventCoder(IDL as Idl);
      // @ts-expect-error - runtime shape compatible with EventParser
      this.eventParser = new EventParser(new PublicKey(programId), { events: eventCoder });
    }
  }

  /**
   * Called by indexer when instruction is StartRound. Parses logs and upserts round_history.
   */
  async handleInstruction(payload: RawInstructionPayload): Promise<void> {
    if (payload.instruction !== 'StartRound') return;

    const events = this.eventParser?.parseLogs(payload.logs) ?? [];
    for (const evt of events) {
      if (evt.name !== 'StartRoundEvent') continue;

      const data = evt.data as StartRoundEventData;
      if (data?.round_id == null || data?.hashed_seed == null) continue;

      const roundId =
        typeof data.round_id === 'number'
          ? data.round_id
          : (data.round_id as { toNumber: () => number }).toNumber();
      const hashedSeed = hashedSeedToString(data.hashed_seed);

      const round: IndexedRoundStart = {
        roundId,
        hashedSeed,
        authority:
          typeof data.authority?.toBase58 === 'function'
            ? data.authority.toBase58()
            : String(data.authority ?? ''),
        txHash: payload.signature,
        slot: payload.slot,
        blockTime: payload.blockTime,
      };

      await this.upsertRound(round);
      break; // one StartRoundEvent per tx
    }
  }

  /** Upsert round_history by round_id. Inserts with defaults; on conflict updates only hashed_seed, tx_hash, timestamp. */
  async upsertRound(round: IndexedRoundStart): Promise<void> {
    try {
      const roundIdStr = String(round.roundId);
      const timestamp = round.blockTime != null ? new Date(round.blockTime * 1000) : null;
      const existing = await this.roundHistoryRepo.findOne({ where: { round_id: roundIdStr } });
      if (existing) {
        existing.hashed_seed = round.hashedSeed;
        existing.tx_hash = round.txHash;
        existing.timestamp = timestamp;
        await this.roundHistoryRepo.save(existing);
      } else {
        await this.roundHistoryRepo.save(
          this.roundHistoryRepo.create({
            round_id: roundIdStr,
            winning_sperm_id: null,
            total_pot: '0',
            total_address: 0,
            is_babyking_hit: false,
            hashed_seed: round.hashedSeed,
            tx_hash: round.txHash,
            timestamp,
          }),
        );
      }
      this.logger.log(
        `Round recorded: round_id=${round.roundId} tx=${round.txHash} hashed_seed=${round.hashedSeed.slice(0, 16)}...`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to upsert round: ${err?.message}`, err?.stack);
      throw err;
    }
  }
}
