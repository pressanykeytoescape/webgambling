import { Injectable } from '@angular/core';
import payoutsConfig from '../../../assets/config/payouts.json';
import { RngService } from '../../core/services/rng.service';

/**
 * Service encapsulating slot machine game logic.  It generates random
 * outcomes using the injected RNG and computes payouts according to the
 * configuration defined in `payouts.json`.  The service is synchronous
 * but returns deterministic results when the RNG is seeded.
 */
@Injectable({ providedIn: 'root' })
export class SlotsService {
  private symbols: string[];
  private payouts: Record<string, Record<string, number>>;

  constructor(private rng: RngService) {
    this.symbols = (payoutsConfig as any).symbols;
    this.payouts = (payoutsConfig as any).payouts;
  }

  /**
   * Perform a spin on the slot machine.  The bet is deducted by the reducer;
   * this method returns the grid of symbols and the total payout (0 if no
   * winning lines).  A 3×3 grid is produced with 5 paylines: three rows
   * and two diagonals.
   */
  spin(bet: number): { symbols: string[][]; payout: number } {
    const reels: string[][] = [];
    for (let col = 0; col < 3; col++) {
      const column: string[] = [];
      for (let row = 0; row < 3; row++) {
        const rand = this.rng.next();
        const index = Math.floor(rand * this.symbols.length);
        column.push(this.symbols[index]);
      }
      reels.push(column);
    }
    // Compute paylines
    const lines: string[][] = [
      [reels[0][0], reels[1][0], reels[2][0]],
      [reels[0][1], reels[1][1], reels[2][1]],
      [reels[0][2], reels[1][2], reels[2][2]],
      [reels[0][0], reels[1][1], reels[2][2]],
      [reels[0][2], reels[1][1], reels[2][0]]
    ];
    let payout = 0;
    for (const line of lines) {
      const first = line[0];
      if (line.every((sym) => sym === first)) {
        const payDef = this.payouts[first];
        if (payDef && payDef['3']) {
          payout += bet * payDef['3'];
        }
      }
    }
    return { symbols: reels, payout };
  }
}