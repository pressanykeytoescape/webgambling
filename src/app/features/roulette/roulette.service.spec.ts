import { RouletteService } from './roulette.service';
import { RngService } from '../../core/services/rng.service';

describe('RouletteService', () => {
  it('returns a valid winning number and payout for number bet', () => {
    const rng = new RngService();
    rng.seed(99);
    const service = new RouletteService(rng);
    const betAmount = 10;
    const result = service.spin(betAmount, 'number', 5);
    expect(result.winningNumber).toBeGreaterThanOrEqual(0);
    expect(result.winningNumber).toBeLessThanOrEqual(36);
    expect(['red', 'black', 'green']).toContain(result.color);
    // Payout should be either 0 or 36 * betAmount
    expect([0, betAmount * 36]).toContain(result.payout);
  });
});