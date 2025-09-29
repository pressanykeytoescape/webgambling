// ...existing code...
import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { AppState } from '../../core/state';
import * as GameSelectors from '../../core/state/game.selectors';
import * as GameActions from '../../core/state/game.actions';

@Component({
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.css']
})
export class RouletteComponent implements OnDestroy {
  currentBalance: number = 0;
  allIn(balance: number): void {
    if (this.spinning) return;
    this.bet = Math.max(this.minBet, balance);
    this.spin();
  }
  bet = 10;
  minBet = 1;
  maxBet = 100; // Wird nicht mehr als Limit verwendet, bleibt für UI/Info
  betType: string = 'color';
  betValue: number | string = 'red';
  balance$ = this.store.select(GameSelectors.selectBalance);
  resultMessage = '';
  spinning = false;
  winningNumber: number | null = null;
  ballLanded = false;
  private sub?: Subscription;

  // Roulette wheel numbers in European roulette order
  wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  
  // Red numbers in roulette
  redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  // Particles for background animation
  particles = Array.from({ length: 15 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    delay: Math.random() * 10
  }));

  constructor(private store: Store<AppState>, private actions$: Actions) {
    this.sub = this.actions$
      .pipe(ofType(GameActions.rouletteResult))
      .subscribe(({ winningNumber, color, payout }) => {
        this.winningNumber = winningNumber ?? null;
        
        // Simulate ball landing animation
        setTimeout(() => {
          this.ballLanded = true;
          this.spinning = false;
          
          if (payout > 0) {
            this.resultMessage = `Gewonnen! Zahl: ${winningNumber} (${color}).`;
          } else {
            this.resultMessage = `Verloren! Zahl: ${winningNumber} (${color}).`;
          }
        }, 3000); // 3 second spin animation
      });
  }

  onBetTypeChange(type: string): void {
    this.betType = type;
    // Reset bet value depending on type
    switch (type) {
      case 'color':
        this.betValue = 'red';
        break;
      case 'number':
        this.betValue = 0;
        break;
      case 'even':
      case 'odd':
      case 'dozen1':
      case 'dozen2':
      case 'dozen3':
        this.betValue = '';
        break;
    }
  }

  onBetTypeSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.onBetTypeChange(value);
  }

  spin(): void {
    if (this.spinning) return;
  const betAmount = Math.max(this.minBet, this.bet);
  this.bet = betAmount;
    this.spinning = true;
    this.ballLanded = false;
    this.winningNumber = null;
    this.resultMessage = '';
    this.store.dispatch(
      GameActions.rouletteSpin({ betAmount, betType: this.betType, betValue: this.betValue })
    );
  }

  isRedNumber(num: number): boolean {
    return this.redNumbers.includes(num);
  }

  isBlackNumber(num: number): boolean {
    return num !== 0 && !this.redNumbers.includes(num);
  }

  selectNumberBet(num: number): void {
    if (this.spinning) return;
    this.betType = 'number';
    this.betValue = num;
  }

  selectColorBet(color: string): void {
    if (this.spinning) return;
    this.betType = 'color';
    this.betValue = color;
  }

  selectBetType(type: string): void {
    if (this.spinning) return;
    this.betType = type;
    this.betValue = '';
  }

  decreaseBet(): void {
    if (this.bet > this.minBet) {
      this.bet = Math.max(this.minBet, this.bet - 1);
    }
  }

  increaseBet(): void {
    this.bet = this.bet + 1;
  }

  clearBets(): void {
    if (this.spinning) return;
    this.betType = '';
    this.betValue = '';
  }

  getResultClass(): string {
    if (this.resultMessage.includes('Gewonnen')) {
      return 'winning';
    } else if (this.resultMessage.includes('Verloren')) {
      return 'losing';
    }
    return '';
  }

  isWinning(): boolean {
    return this.resultMessage.includes('Gewonnen');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Balance abonnieren
  ngOnInit(): void {
    this.balance$.subscribe(bal => this.currentBalance = bal);
  }
}