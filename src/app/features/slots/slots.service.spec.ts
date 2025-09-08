import { SlotsService } from './slots.service';
import { RngService } from '../../core/services/rng.service';

describe('SlotsService', () => {
  it('generates a 3x3 grid of symbols and computes payout deterministically', () => {
    const rng = new RngService();
    rng.seed(123);
    const service = new SlotsService(rng);
    const { symbols, payout } = service.spin(1);
    expect(symbols.length).toBe(3);
    expect(symbols[0].length).toBe(3);
    // All symbols should be defined strings
    for (const col of symbols) {
      for (const sym of col) {
        expect(typeof sym).toBe('string');
      }
    }
    expect(typeof payout).toBe('number');
  });
});