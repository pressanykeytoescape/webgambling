import { Injectable } from '@angular/core';
import { RngService } from '../../core/services/rng.service';

export interface RouletteResult {
  winningNumber: number;
  color: 'red' | 'black' | 'green';
  payout: number;
}

@Injectable({ providedIn: 'root' })
export class RouletteService {
  private redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  constructor(private rng: RngService) {}

  private getColor(num: number): 'red' | 'black' | 'green' {
    if (num === 0) return 'green';
    return this.redNumbers.has(num) ? 'red' : 'black';
  }

  spin(betAmount: number, betType: string, betValue?: number | string): RouletteResult {
    const winningNumber = Math.floor(this.rng.next() * 37);
    const color = this.getColor(winningNumber);
    let payout = 0;
    switch (betType) {
      case 'number': {
        if (betValue === winningNumber) {
          payout = betAmount * 36;
        }
        break;
      }
      case 'color': {
        if (betValue === color) {
          payout = betAmount * 2;
        }
        break;
      }
      case 'even': {
        if (winningNumber !== 0 && winningNumber % 2 === 0) {
          payout = betAmount * 2;
        }
        break;
      }
      case 'odd': {
        if (winningNumber % 2 === 1) {
          payout = betAmount * 2;
        }
        break;
      }
      case 'dozen1': {
        if (winningNumber >= 1 && winningNumber <= 12) {
          payout = betAmount * 3;
        }
        break;
      }
      case 'dozen2': {
        if (winningNumber >= 13 && winningNumber <= 24) {
          payout = betAmount * 3;
        }
        break;
      }
      case 'dozen3': {
        if (winningNumber >= 25 && winningNumber <= 36) {
          payout = betAmount * 3;
        }
        break;
      }
    }
    return { winningNumber, color, payout };
  }
}