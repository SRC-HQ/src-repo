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
    const seed = crypto.randomBytes(32).toString('hex');

    // Commitment = hash of seed (can't reverse to get seed)
    const commitment = crypto.createHash('sha256').update(seed).digest('hex');

    return { seed, commitment };
  }

  /**
   * Verify that a seed matches its commitment
   * Users can verify this themselves
   */
  verifyCommitment(seed: string, commitment: string): boolean {
    const calculatedCommitment = crypto
      .createHash('sha256')
      .update(seed)
      .digest('hex');

    return calculatedCommitment === commitment;
  }

  /**
   * Determine winner using seed
   * Deterministic: same seed always = same winner
   */
  determineWinner(seed: string, spermCount: number): number {
    // Use seed to generate deterministic random number
    const hash = crypto.createHash('sha256').update(seed + ':winner').digest();

    // Convert first 4 bytes to number, mod by sperm count
    const randomValue = hash.readUInt32BE(0);
    const winner = randomValue % spermCount;

    return winner;
  }

  /**
   * Generate deterministic race positions for animation
   * Same seed = same race every time
   */
  generateRaceAnimation(
    seed: string,
    spermCount: number,
    winner: number,
    frameCount: number,
  ): number[][] {
    const positions: number[][] = [];
    const speeds = this.generateSpeeds(seed, spermCount, winner);

    // Track current positions
    const currentPositions = Array(spermCount).fill(0);

    for (let frame = 0; frame < frameCount; frame++) {
      const progress = frame / (frameCount - 1);

      const framePositions = currentPositions.map((_, spermId) => {
        // Get deterministic variation for this frame
        const variation = this.getVariation(seed, spermId, frame);

        // Calculate target position with easing
        const easedProgress = this.easeInOut(progress);
        let position = easedProgress * 100 * speeds[spermId] * variation;

        // Ensure winner reaches 100 at the end
        if (spermId === winner && frame === frameCount - 1) {
          position = 100;
        }

        // Clamp to 0-100
        return Math.min(100, Math.max(0, position));
      });

      positions.push(framePositions);
    }

    return positions;
  }

  /**
   * Generate base speeds for each sperm
   */
  private generateSpeeds(seed: string, count: number, winner: number): number[] {
    const speeds: number[] = [];

    for (let i = 0; i < count; i++) {
      const hash = crypto
        .createHash('sha256')
        .update(seed + `:speed:${i}`)
        .digest();

      // Base speed between 0.75 and 0.95
      let speed = 0.75 + (hash.readUInt32BE(0) / 0xffffffff) * 0.2;

      // Winner gets boost to ensure they win
      if (i === winner) {
        speed = 1.0;
      }

      speeds.push(speed);
    }

    return speeds;
  }

  /**
   * Get variation for a specific frame
   */
  private getVariation(seed: string, spermId: number, frame: number): number {
    const hash = crypto
      .createHash('sha256')
      .update(seed + `:var:${spermId}:${Math.floor(frame / 5)}`)
      .digest();

    // Small variation: 0.97 to 1.03
    return 0.97 + (hash.readUInt32BE(0) / 0xffffffff) * 0.06;
  }

  /**
   * Ease in-out function for smooth animation
   */
  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}
