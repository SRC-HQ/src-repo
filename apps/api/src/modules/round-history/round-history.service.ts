import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicKey } from '@solana/web3.js';
import { BorshEventCoder, EventParser, Idl } from '@coral-xyz/anchor';
import * as IDL from '@sperm-race/contract-types/idl';
import { RoundHistory } from '@/entities/round-history.entity';
import { BetHistory } from '@/entities/bet-history.entity';
import { DistributionHistory } from '@/entities/distribution-history.entity';
import { IndexedRoundStart, IndexedRoundResolution } from '@/common';
import { DistributionHistoryService } from '../distribution-history/distribution-history.service';
import { RawInstructionPayload } from '@/common/types/indexing';

export interface RoundWinnerUserBet {
  user_address: string;
  sperm_id: number;
  amount: string;
  tx_hash: string;
}

export interface RoundWinnerUserWinning {
  user_address: string;
  sperm_id: number;
  bet_amount: string;
  winning_amount: string;
  claim_tx_hash: string | null;
}

export interface RoundWinnerResponse {
  round_id: string;
  winner_sperm_id: number | null;
  total_pot: string;
  total_user: number;
  user_pots: RoundWinnerUserBet[];
  timestamp: Date | null;
  tx_hash: string;
  user_winnings: RoundWinnerUserWinning[] | null;
}

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
    @InjectRepository(DistributionHistory)
    private readonly distributionHistoryRepo: Repository<DistributionHistory>,
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

  /**
   * Fetch previous resolved rounds with winner data, user bets, and winning allocations.
   * Uses skip/limit pagination with default limit of 10.
   */
  async getPreviousRoundWinners(
    skip = 0,
    limit = 10,
  ): Promise<RoundWinnerResponse[]> {
    const rounds = await this.roundHistoryRepo
      .createQueryBuilder('r')
      .select([
        'r.round_id',
        'r.winning_sperm_id',
        'r.total_pot',
        'r.total_address',
        'r.timestamp',
        'r.tx_hash',
      ])
      .where('r.winning_sperm_id IS NOT NULL')
      .orderBy('r.round_id', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    if (rounds.length === 0) return [];

    const roundIds = rounds.map((r) => r.round_id);

    const [bets, distributions] = await Promise.all([
      this.betHistoryRepo
        .createQueryBuilder('b')
        .select(['b.round_id', 'b.user_address', 'b.sperm_id', 'b.amount', 'b.tx_hash'])
        .where('b.round_id IN (:...roundIds)', { roundIds })
        .getMany(),
      this.distributionHistoryRepo
        .createQueryBuilder('d')
        .select([
          'd.round_id',
          'd.user_address',
          'd.winning_sperm_id',
          'd.bet_amount',
          'd.winning_amount',
          'd.claim_tx_hash',
        ])
        .where('d.round_id IN (:...roundIds)', { roundIds })
        .getMany(),
    ]);

    const betsByRound = new Map<string, RoundWinnerUserBet[]>();
    for (const bet of bets) {
      const list = betsByRound.get(bet.round_id) ?? [];
      list.push({
        user_address: bet.user_address,
        sperm_id: bet.sperm_id,
        amount: bet.amount,
        tx_hash: bet.tx_hash,
      });
      betsByRound.set(bet.round_id, list);
    }

    const distributionsByRound = new Map<string, RoundWinnerUserWinning[]>();
    for (const d of distributions) {
      const list = distributionsByRound.get(d.round_id) ?? [];
      list.push({
        user_address: d.user_address,
        sperm_id: d.winning_sperm_id,
        bet_amount: d.bet_amount,
        winning_amount: d.winning_amount,
        claim_tx_hash: d.claim_tx_hash,
      });
      distributionsByRound.set(d.round_id, list);
    }

    return rounds.map((r) => {
      const userBets = betsByRound.get(r.round_id) ?? [];
      const userWinnings = distributionsByRound.get(r.round_id) ?? [];

      return {
        round_id: r.round_id,
        winner_sperm_id: r.winning_sperm_id,
        total_pot: r.total_pot,
        total_user: r.total_address,
        user_pots: userBets,
        timestamp: r.timestamp,
        tx_hash: r.tx_hash,
        user_winnings: userWinnings.length > 0 ? userWinnings : null,
      };
    });
  }

}
