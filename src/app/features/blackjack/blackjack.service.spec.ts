import { BlackjackService, Card } from './blackjack.service';
import { RngService } from '../../core/services/rng.service';

describe('BlackjackService', () => {
  const rng = new RngService();
  const service = new BlackjackService(rng);
  it('calculates hand values with soft ace correctly', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♦' }
    ];
    const result = service.evaluateHand(hand);
    expect(result.value).toBe(21);
    expect(result.blackjack).toBe(true);
    expect(result.bust).toBe(false);
  });
  it('busts when value exceeds 21 even after adjusting aces', () => {
    const hand: Card[] = [
      { rank: 'A', suit: '♠' },
      { rank: '9', suit: '♦' },
      { rank: '8', suit: '♣' },
      { rank: '5', suit: '♥' }
    ];
    const result = service.evaluateHand(hand);
    expect(result.bust).toBe(true);
  });
});