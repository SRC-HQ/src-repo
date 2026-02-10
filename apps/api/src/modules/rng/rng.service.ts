import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/** RNG: value = sha256(slot_hash || seed || round_id), r = xor(4×u64), winner = r % 10, baby_king = reverse_bits(r) % 650 == 0 */
const SPERM_COUNT = 10;
const BABY_KING_MOD = 650;

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
   * @deprecated Use deriveWinnerAndBabyKing(slotHash, serverSeed, roundId) for GODL-style RNG. Kept for tests.
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
