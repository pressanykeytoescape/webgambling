import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { AppState } from '../../core/state';
import * as GameSelectors from '../../core/state/game.selectors';
import * as GameActions from '../../core/state/game.actions';

@Component({
  selector: 'app-slots',
  templateUrl: './slots.component.html',
  styleUrls: ['./slots.component.css']
})
export class SlotsComponent implements OnInit, OnDestroy {
  bet = 1;
  minBet = 1;
  maxBet = 100;
  balance$ = this.store.select(GameSelectors.selectBalance);
  reels: string[][] = [
    ['🍒', '🔔', '7'],
    ['🍋', '⭐', '🍒'],
    ['7', '🔔', '🍋']
  ];
  spinning = false;
  lastPayout = 0;

  private sub?: Subscription;

  constructor(private store: Store<AppState>, private actions$: Actions) {}

  ngOnInit(): void {
    // Listen for spin results to update the displayed reels
    this.sub = this.actions$
      .pipe(ofType(GameActions.slotsSpinResult))
      .subscribe(({ symbols, payout }) => {
        this.reels = symbols;
        this.lastPayout = payout;
        this.spinning = false;
      });
  }

  spin(): void {
    if (this.spinning) return;
    // check bet within bounds and less or equal to balance
    this.spinning = true;
    const betValue = Math.max(this.minBet, Math.min(this.maxBet, this.bet));
    this.store.dispatch(GameActions.slotsSpin({ bet: betValue }));
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}