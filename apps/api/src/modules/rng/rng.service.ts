import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { RaceSegment, SpermRaceParams } from '../../common';

/** RNG: value = sha256(slot_hash || seed || round_id), r = xor(4×u64), winner = r % 10, baby_king = reverse_bits(r) % 650 == 0 */
const SPERM_COUNT = 10;
const BABY_KING_MOD = 650;

/** Boost types: [from, to, mult] normalized time 0-1. All yield final progress < 1 for non-winners. */
const BOOST_TEMPLATES: [number, number, number][] = [
  [0, 0.4, 1.4],       // early surge
  [0.35, 0.55, 1.35],  // mid burst
  [0.55, 0.85, 1.3],   // late sprint
];

@Injectable()
export class RngService {
  /**
   * Generate a random seed and its commitment (hash)
   * The commitment is published BEFORE bets close
   * The seed is revealed AFTER bets close
   */
  generateCommitment(): { seed: string; commitment: string } {
    const seed = crypto.randomBytes(32).toString('hex');
    const commitment = crypto.createHash('sha256').update(Buffer.from(seed, 'hex')).digest('hex');
    return { seed, commitment };
  }

  /**
   * Verify that a seed matches its commitment
   */
  verifyCommitment(seed: string, commitment: string): boolean {
    const calculatedCommitment = crypto
      .createHash('sha256')
      .update(Buffer.from(seed, 'hex'))
      .digest('hex');
    return calculatedCommitment === commitment;
  }

  /**
   *  same as on-chain (slot_hash || seed || round_id) -> sha256 -> r -> winner & baby_king.
   * Use for off-chain preview once slot hash is known. slotHash and serverSeed must be 32 bytes.
   */
  deriveWinnerAndBabyKing(
    slotHash: Buffer,
    serverSeed: Buffer,
    roundId: number,
  ): { winnerId: number; babyKingHit: boolean } {
    const roundIdBytes = Buffer.alloc(8);
    roundIdBytes.writeBigUInt64LE(BigInt(roundId), 0);
    const preimage = Buffer.concat([slotHash, serverSeed, roundIdBytes]);
    const entropyHash = crypto.createHash('sha256').update(preimage).digest();

    const u64 = (offset: number) => entropyHash.readBigUInt64LE(offset);
    const r = u64(0) ^ u64(8) ^ u64(16) ^ u64(24);
    const winnerId = Number(r % BigInt(SPERM_COUNT));
    const reversed = this.reverseBits64(r);
    const babyKingHit = reversed % BigInt(BABY_KING_MOD) === 0n;
    return { winnerId, babyKingHit };
  }

  /**
   * Derive deterministic race params for Strategy A (authoritative race animation).
   * Base speeds + randomized boosts for 0–5 sperms per round (winner inclusive).
   * Boosts are cosmetic; outcome is fixed. No predictable pattern (winner can have boost too).
   */
  deriveRaceParams(
    slotHash: Buffer,
    serverSeed: Buffer,
    roundId: number,
    winnerId: number,
    spermCount: number,
  ): SpermRaceParams[] {
    const roundIdBytes = Buffer.alloc(8);
    roundIdBytes.writeBigUInt64LE(BigInt(roundId), 0);
    const preimage = Buffer.concat([slotHash, serverSeed, roundIdBytes]);
    const hash = crypto.createHash('sha256').update(preimage).digest();

    const MIN_SPEED = 0.7;
    const MAX_NON_WINNER = 0.95;

    const params: SpermRaceParams[] = [];
    const allSpermIds = Array.from({ length: spermCount }, (_, i) => i);

    for (let i = 0; i < spermCount; i++) {
      const b1 = hash[(i * 3) % 32] ?? 0;
      const b2 = hash[(i * 7 + 1) % 32] ?? 0;
      const normalized = (b1 + b2) / 510;
      const baseSpeed = i === winnerId ? 1.0 : MIN_SPEED + normalized * (MAX_NON_WINNER - MIN_SPEED);
      params.push({ baseSpeed });
    }

    // Pick 0–5 sperms (any, including winner) to get a boost. Deterministic from hash.
    const numBoosted = (hash[11] ?? 0) % 6;
    const shuffled = [...allSpermIds].sort((a, b) => {
      const ha = (hash[(a + 5) % 32] ?? 0) + a * 7 + (hash[(a + 13) % 32] ?? 0) * 11;
      const hb = (hash[(b + 5) % 32] ?? 0) + b * 7 + (hash[(b + 13) % 32] ?? 0) * 11;
      return ha - hb;
    });
    const boostIndices = shuffled.slice(0, numBoosted);

    // Assign random boost type (early / mid / late) per boosted sperm
    for (let j = 0; j < boostIndices.length; j++) {
      const spermId = boostIndices[j];
      const templateIdx = ((hash[(17 + j * 3) % 32] ?? 0) + (hash[(19 + j) % 32] ?? 0) + j) % BOOST_TEMPLATES.length;
      const [from, to, mult] = BOOST_TEMPLATES[templateIdx];
      const segments: RaceSegment[] = [];
      if (from > 0) segments.push({ from: 0, to: from, mult: 1 });
      segments.push({ from, to, mult });
      if (to < 1) segments.push({ from: to, to: 1, mult: 1 });
      params[spermId].segments = segments;
    }

    return params;
  }

  /**
   * Compute race leaderboard (1st to last) from race params.
   * Integrates progress at t=1 for each sperm and sorts by descending progress.
   */
  computeLeaderboard(raceParams: SpermRaceParams[]): number[] {
    const progressAtT1 = (p: SpermRaceParams): number => {
      const { baseSpeed, segments } = p;
      if (!segments?.length) return baseSpeed;
      let total = 0;
      for (const seg of segments) {
        total += (seg.to - seg.from) * baseSpeed * seg.mult;
      }
      return total;
    };

    return raceParams
      .map((p, i) => ({ spermId: i, progress: progressAtT1(p) }))
      .sort((a, b) => b.progress - a.progress)
      .map((x) => x.spermId);
  }

  /** 64-bit unsigned bit reversal (matches contract reverse_bits) */
  private reverseBits64(n: bigint): bigint {
    let r = 0n;
    let x = n;
    for (let i = 0; i < 64; i++) {
      r = (r << 1n) | (x & 1n);
      x >>= 1n;
    }
    return r;
  }

  /**
   * @deprecated Use deriveWinnerAndBabyKing(slotHash, serverSeed, roundId)
   */
  determineWinner(seed: string, spermCount: number): number {
    const hash = crypto
      .createHash('sha256')
      .update(Buffer.from(seed, 'hex'))
      .digest();
    const randomValue = hash.readUInt32BE(0);
    return randomValue % spermCount;
  }
}
