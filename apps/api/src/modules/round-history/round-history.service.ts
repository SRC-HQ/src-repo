import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import { BorshEventCoder, EventParser, Idl } from '@coral-xyz/anchor';
import * as IDL from '@sperm-race/contract-types/idl';
import { RoundHistory } from '@/entities/round-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';
import { IndexedRoundStart, IndexedRoundResolution } from '@/common';
import { DistributionHistoryService } from '../distribution-history/distribution-history.service';
import { RawInstructionPayload } from '@/common/types/indexing';

/** Decoded StartRoundEvent from chain (Anchor BN/PublicKey / bytes). */
interface StartRoundEventData {
  round_id: { toNumber: () => number } | number;
  hashed_seed: number[] | Uint8Array | Buffer;
  authority: { toBase58: () => string } | string;
}

/** Decoded LockBettingEvent from chain (Anchor BN/PublicKey / bytes). */
interface LockBettingEventData {
  round_id: { toNumber: () => number } | number;
  authority: { toBase58: () => string } | string;
}

/** Decoded ResolveRoundEvent from chain (Anchor BN/PublicKey / bytes). */
interface ResolveRoundEventData {
  round_id: { toNumber: () => number } | number;
  winner_id: { toNumber: () => number } | number;
  total_pot: { toString: () => string } | number | string;
  is_baby_king_hit: boolean;
  baby_king_jackpot_snapshot: { toString: () => string } | number | string;
}

/** Decoded ClaimWinningsEvent from chain (Anchor BN/PublicKey). */
interface ClaimWinningsEventData {
  round_id: { toNumber: () => number } | number;
  user: { toBase58: () => string } | string;
  sperm_id: { toNumber: () => number } | number;
  amount_claimed: { toString: () => string } | number | string;
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
    @InjectRepository(BetHistory)
    private readonly betHistoryRepo: Repository<BetHistory>,
    private readonly distributionHistoryService: DistributionHistoryService,
  ) {
    const programId = this.configService.get<string>('PROGRAM_ID');
    if (programId) {
      const eventCoder = new BorshEventCoder(IDL as Idl);
      // @ts-expect-error - runtime shape compatible with EventParser
      this.eventParser = new EventParser(new PublicKey(programId), { events: eventCoder });
    }
  }

  /**
   * Called by indexer when instruction is StartRound, LockBetting, ResolveRound, or ClaimWinnings.
   * - StartRound: parses logs and upserts round_history.
   * - LockBetting: parses event only (no DB interaction for now).
   * - ResolveRound: upserts round_history and creates distribution_history rows.
   * - ClaimWinnings: updates distribution_history.claim_tx_hash.
   */
  async handleInstruction(payload: RawInstructionPayload): Promise<void> {
    const events = this.eventParser?.parseLogs(payload.logs) ?? [];
    for (const evt of events) {
      if (evt.name === 'StartRoundEvent') {
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
            typeof (data.authority as any)?.toBase58 === 'function'
              ? (data.authority as any).toBase58()
              : String(data.authority ?? ''),
          txHash: payload.signature,
          slot: payload.slot,
          blockTime: payload.blockTime,
        };

        await this.upsertRound(round);
        break; // one StartRoundEvent per tx
      }

      if (evt.name === 'LockBettingEvent') {
        const data = evt.data as LockBettingEventData;
        if (data?.round_id == null) continue;

        const roundId =
          typeof data.round_id === 'number'
            ? data.round_id
            : (data.round_id as { toNumber: () => number }).toNumber();

        const authority =
          typeof (data.authority as any)?.toBase58 === 'function'
            ? (data.authority as any).toBase58()
            : String(data.authority ?? '');

        this.logger.log(
          `LockBettingEvent parsed: round_id=${roundId} authority=${authority} tx=${payload.signature} slot=${payload.slot}`,
        );
        break; // one LockBettingEvent per tx
      }

      if (evt.name === 'ResolveRoundEvent') {
        const data = evt.data as ResolveRoundEventData;
        if (data?.round_id == null || data?.winner_id == null || data?.total_pot == null) continue;

        const roundId =
          typeof data.round_id === 'number'
            ? data.round_id
            : (data.round_id as { toNumber: () => number }).toNumber();

        const winnerSpermId =
          typeof data.winner_id === 'number'
            ? data.winner_id
            : (data.winner_id as { toNumber: () => number }).toNumber();

        const totalPot =
          typeof data.total_pot === 'number'
            ? String(data.total_pot)
            : typeof (data.total_pot as any)?.toString === 'function'
              ? (data.total_pot as any).toString()
              : String(data.total_pot);

        const isBabyKingHit = Boolean((data as any).is_baby_king_hit);

        const babyKingJackpotSnapshot =
          typeof (data as any).baby_king_jackpot_snapshot === 'number'
            ? String((data as any).baby_king_jackpot_snapshot)
            : typeof (data as any).baby_king_jackpot_snapshot?.toString === 'function'
              ? (data as any).baby_king_jackpot_snapshot.toString()
              : String((data as any).baby_king_jackpot_snapshot ?? '0');

        const totalAddress = await this.computeTotalAddress(roundId);

        const resolution: IndexedRoundResolution = {
          roundId,
          winnerSpermId,
          totalPot,
          totalAddress,
          isBabyKingHit,
          babyKingJackpotSnapshot,
          txHash: payload.signature,
          slot: payload.slot,
          blockTime: payload.blockTime,
        };

        await this.applyResolution(resolution);
        await this.distributionHistoryService.createDistributionHistoryFromResolution(resolution);
        break; // one ResolveRoundEvent per tx
      }

      if (evt.name === 'ClaimWinningsEvent') {
        const data = evt.data as ClaimWinningsEventData;
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

        await this.distributionHistoryService.markClaimed(
          String(roundId),
          userAddress,
          spermId,
          payload.signature,
        );
        break; // one ClaimWinningsEvent per tx
      }
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

  /** Compute total unique addresses that bet in a round (from bet_history). */
  private async computeTotalAddress(roundId: number): Promise<number> {
    const roundIdStr = String(roundId);
    const result = await this.betHistoryRepo
      .createQueryBuilder('bet')
      .select('COUNT(DISTINCT bet.user_address)', 'cnt')
      .where('bet.round_id = :roundId', { roundId: roundIdStr })
      .getRawOne<{ cnt?: string }>();
    return result?.cnt != null ? Number(result.cnt) : 0;
  }

  /** Apply resolution data to existing round_history row (or create if missing). */
  async applyResolution(resolution: IndexedRoundResolution): Promise<void> {
    try {
      const roundIdStr = String(resolution.roundId);
      const timestamp =
        resolution.blockTime != null ? new Date(resolution.blockTime * 1000) : null;

      let existing = await this.roundHistoryRepo.findOne({ where: { round_id: roundIdStr } });

      if (!existing) {
        existing = this.roundHistoryRepo.create({
          round_id: roundIdStr,
          winning_sperm_id: resolution.winnerSpermId,
          total_pot: resolution.totalPot,
          total_address: resolution.totalAddress,
          is_babyking_hit: resolution.isBabyKingHit,
          // Fallback hashed_seed when StartRound row is somehow missing.
          hashed_seed: '0'.repeat(64),
          tx_hash: resolution.txHash,
          timestamp,
        });
      } else {
        existing.winning_sperm_id = resolution.winnerSpermId;
        existing.total_pot = resolution.totalPot;
        existing.total_address = resolution.totalAddress;
        existing.is_babyking_hit = resolution.isBabyKingHit;
        existing.tx_hash = resolution.txHash;
        existing.timestamp = timestamp ?? existing.timestamp;
      }

      await this.roundHistoryRepo.save(existing);

      this.logger.log(
        `Round resolved: round_id=${resolution.roundId} winner=${resolution.winnerSpermId} total_pot=${resolution.totalPot} total_address=${resolution.totalAddress} babyking=${resolution.isBabyKingHit}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to apply round resolution: ${err?.message}`, err?.stack);
      throw err;
    }
  }

}
