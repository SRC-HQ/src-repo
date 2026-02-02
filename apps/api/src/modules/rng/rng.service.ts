import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RngService {

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

}
