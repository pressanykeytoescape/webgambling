import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { AppState } from '../../core/state';
import * as GameSelectors from '../../core/state/game.selectors';
import * as GameActions from '../../core/state/game.actions';
import { BlackjackService, Card } from './blackjack.service';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.css']
})
export class BlackjackComponent {
  bet = 10;
  minBet = 1;
  maxBet = 100;
  balance$ = this.store.select(GameSelectors.selectBalance);
  deck: Card[] = [];
  playerHand: Card[] = [];
  dealerHand: Card[] = [];
  gameState: 'init' | 'playing' | 'finished' = 'init';
  resultMessage = '';
  private sub?: Subscription;

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private bj: BlackjackService
  ) {}

  /**
   * Start a new round by shuffling a new deck, dealing two cards to the player
   * and one to the dealer.  Deduct the bet from the balance via the store.
   */
  deal(): void {
    if (this.gameState === 'playing') return;
    const betAmount = Math.max(this.minBet, Math.min(this.maxBet, this.bet));
    this.bet = betAmount;
    this.store.dispatch(GameActions.blackjackDeal({ bet: betAmount }));
    // create and shuffle deck
    this.deck = this.bj.shuffle(this.bj.createDeck());
    this.playerHand = [];
    this.dealerHand = [];
    // draw initial hands
    ({ card: this.playerHand[0], deck: this.deck } = this.bj.draw(this.deck));
    ({ card: this.dealerHand[0], deck: this.deck } = this.bj.draw(this.deck));
    ({ card: this.playerHand[1], deck: this.deck } = this.bj.draw(this.deck));
    // evaluate immediate blackjack
    const playerEval = this.bj.evaluateHand(this.playerHand);
    const dealerEval = this.bj.evaluateHand(this.dealerHand);
    if (playerEval.blackjack) {
      if (dealerEval.blackjack) {
        // push: return bet
        this.finishRound(betAmount);
        this.resultMessage = 'Push! Beide Blackjacks.';
      } else {
        // blackjack pays 3:2 => 2.5× bet profit (since bet already subtracted)
        this.finishRound(betAmount * 2.5);
        this.resultMessage = 'Blackjack! Du gewinnst.';
      }
    } else {
      this.gameState = 'playing';
      this.resultMessage = '';
    }
  }

  /**
   * Draw another card for the player.  If the player busts, end the round.
   */
  hit(): void {
    if (this.gameState !== 'playing') return;
    ({ card: this.playerHand[this.playerHand.length], deck: this.deck } = this.bj.draw(this.deck));
    const evalPlayer = this.bj.evaluateHand(this.playerHand);
    if (evalPlayer.bust) {
      this.finishRound(0);
      this.resultMessage = 'Bust! Verloren.';
    }
  }

  /**
   * Stand, letting the dealer draw to at least 17 and then comparing
   * hands.  Compute the payout accordingly.
   */
  stand(): void {
    if (this.gameState !== 'playing') return;
    // Dealer draws until 17 or more
    let dealerEval = this.bj.evaluateHand(this.dealerHand);
    while (dealerEval.value < 17) {
      ({ card: this.dealerHand[this.dealerHand.length], deck: this.deck } = this.bj.draw(this.deck));
      dealerEval = this.bj.evaluateHand(this.dealerHand);
    }
    const playerEval = this.bj.evaluateHand(this.playerHand);
    let payout = 0;
    if (dealerEval.bust || playerEval.value > dealerEval.value) {
      payout = this.bet * 2;
      this.resultMessage = 'Gewonnen!';
    } else if (playerEval.value < dealerEval.value) {
      payout = 0;
      this.resultMessage = 'Verloren!';
    } else {
      // push
      payout = this.bet;
      this.resultMessage = 'Push.';
    }
    this.finishRound(payout);
  }

  private finishRound(payout: number): void {
    this.gameState = 'finished';
    this.store.dispatch(GameActions.blackjackResult({ payout }));
  }

  getDealerScore(): number {
    return this.bj.evaluateHand(this.dealerHand).value;
  }

  getPlayerScore(): number {
    return this.bj.evaluateHand(this.playerHand).value;
  }

  getSuitClass(suit: string): string {
    return suit === '♥' || suit === '♦' ? 'red-suit' : 'black-suit';
  }

  getSuitSymbol(suit: string): string {
    const suitMap: { [key: string]: string } = {
      'H': '♥',
      'D': '♦',
      'C': '♣',
      'S': '♠'
    };
    return suitMap[suit] || suit;
  }

  decreaseBet(): void {
    if (this.bet > this.minBet) {
      this.bet = Math.max(this.minBet, this.bet - 1);
    }
  }

  increaseBet(): void {
    if (this.bet < this.maxBet) {
      this.bet = Math.min(this.maxBet, this.bet + 1);
    }
  }

  getResultClass(): string {
    if (this.resultMessage.includes('gewinnst') || this.resultMessage.includes('Blackjack')) {
      return 'winning';
    } else if (this.resultMessage.includes('Push')) {
      return 'push';
    } else {
      return 'losing';
    }
  }

  isWinning(): boolean {
    return this.resultMessage.includes('gewinnst') || this.resultMessage.includes('Blackjack');
  }
}