import { Injectable } from '@angular/core';
import { RngService } from '../../core/services/rng.service';

export interface Card {
  rank: string;
  suit: string;
}

@Injectable({ providedIn: 'root' })
export class BlackjackService {
  constructor(private rng: RngService) {}

  /**
   * Generate a standard 52‑card deck.
   */
  createDeck(): Card[] {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  }

  /**
   * Shuffle a deck deterministically using the injected RNG.  This uses the
   * Fisher–Yates algorithm.
   */
  shuffle(deck: Card[]): Card[] {
    const result = deck.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Draw a card from the deck, returning the card and the remaining deck.
   */
  draw(deck: Card[]): { card: Card; deck: Card[] } {
    const [card, ...rest] = deck;
    return { card, deck: rest };
  }

  /**
   * Calculate the value of a hand.  Aces count as 11 or 1 to maximise
   * the hand value without busting.  Returns an object with the numeric
   * value and flags for blackjack or bust.
   */
  evaluateHand(hand: Card[]): { value: number; blackjack: boolean; bust: boolean } {
    let total = 0;
    let aces = 0;
    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank, 10);
      }
    }
    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    const blackjack = hand.length === 2 && total === 21;
    const bust = total > 21;
    return { value: total, blackjack, bust };
  }
}