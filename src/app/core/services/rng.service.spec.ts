import { RngService } from './rng.service';

describe('RngService', () => {
  it('produces deterministic sequence when seeded', () => {
    const rng1 = new RngService();
    const rng2 = new RngService();
    rng1.seed(42);
    rng2.seed(42);
    const values1 = [rng1.next(), rng1.next(), rng1.next()];
    const values2 = [rng2.next(), rng2.next(), rng2.next()];
    expect(values1).toEqual(values2);
    // values should be in [0,1)
    for (const v of values1) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});