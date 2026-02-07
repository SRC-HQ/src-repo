import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RngService {
  /**
   * Generate a random seed and its commitment (hash)
   * The commitment is published BEFORE bets close
   * The seed is revealed AFTER bets close
   */
  generateCommitment(): { seed: string; commitment: string } {
    // Generate cryptographically secure random seed
    const seed = crypto.randomBytes(32).toString('hex')

    // Commitment = hash of seed (can't reverse to get seed)
    const commitment = crypto.createHash('sha256').update(seed).digest('hex');

    return { seed, commitment };
  }

  /**
   * Verify that a seed matches its commitment
   * Users can verify this themselves
   */
  verifyCommitment(seed: string, commitment: string): boolean {
    const calculatedCommitment = crypto.createHash('sha256').update(seed).digest('hex');

    return calculatedCommitment === commitment;
  }

  /**
   * Determine winner using seed
   * Deterministic: same seed always = same winner
   */
  determineWinner(seed: string, spermCount: number): number {
    // Use seed to generate deterministic random number
    const hash = crypto
      .createHash('sha256')
      .update(seed + ':winner')
      .digest();

    // Convert first 4 bytes to number, mod by sperm count
    const randomValue = hash.readUInt32BE(0);
    const winner = randomValue % spermCount;

    return winner;
  }

}
