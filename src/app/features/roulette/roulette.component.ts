import {Component, OnDestroy, AfterViewInit, PLATFORM_ID, inject, computed, signal} from '@angular/core';
import {AsyncPipe, isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import {AppState} from '../../core/state';
import * as GameActions from '../../core/state/game.actions';
import * as GameSelectors from '../../core/state/game.selectors';
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

type Pocket = { n: number; color: 'red' | 'black' | 'green' };

@Component({
  selector: 'app-roulette',
  standalone: true,
  templateUrl: './roulette.component.html',
  imports: [
    FormsModule,
    AsyncPipe,
    RouterLink,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./roulette.component.css']
})
export class RouletteComponent implements OnDestroy, AfterViewInit {
  // ---- Balance / Wetten ----
  currentBalance: number = 0;
  bet = 10;
  minBet = 1;
  betType: string = 'color';
  betValue: number | string = 'red';
  private activeBetAmount = 0;

  balance$ = this.store.select(GameSelectors.selectBalance);

  // ---- UI-States ----
  resultMessage = '';
  spinning = false;
  winningNumber: number | null = null;
  ballLanded = false;

  private sub?: Subscription;

  private sequence = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  private redSet   = new Set([32,19,21,25,34,27,36,30,23,5,16,1,14,9,18,7,12,3]);

  wheel: Pocket[] = this.sequence.map(n => ({
    n,
    color: n === 0 ? 'green' : (this.redSet.has(n) ? 'red' : 'black')
  }));
  // ---- Partikel (dein bestehender Hintergrund, unverändert) ----
  particles = Array.from({ length: 15 }, () => ({
    x: Math.random() * window.innerWidth,
    delay: Math.random() * 10
  }));

  rotation     = signal(0);                 // Radwinkel (deg), wächst konstant
  ballAngle    = signal(0);                 // Ballwinkel (deg) in Weltkoordinaten
  ballMoving   = signal(false);
  ballAttached = signal(false);
  result       = signal<number | null>(null);

  // --- Parameter (anpassbar im UI) ---
  wheelDegPerSec = 24;                      // konstante Raddrehung (deg/s)
  ballInitDegPerSec = 720;                  // Anfangsgeschwindigkeit Ball (deg/s)
  ballDecel = -240;                         // Bremsung (deg/s²), negativ

  // --- Geometrie/Helper ---
  private readonly startAngle = -90;        // 0° nach oben (zur Spitze)
  private readonly step = 360 / this.sequence.length;
  readonly ballRadius = 175;                // px: Abstand Ball vom Zentrum

  // --- rAF Loop ---
  private rafId: number | null = null;
  private lastTs = 0;
  private ballOmega = 0;                    // aktuelle Ballgeschwindigkeit (deg/s)
  private lockOffset = 0;                   // NEU: ballAngle = rotation + lockOffset, wenn gekoppelt

  ngAfterViewInit(): void {
    if (this.isBrowser) this.startLoop();
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private startLoop() {
    if (!this.isBrowser) return;

    const tick = (ts: number) => {
      if (!this.lastTs) this.lastTs = ts;
      const dt = (ts - this.lastTs) / 1000; // Sekunden
      this.lastTs = ts;

      // Rad gleichmäßig drehen
      this.rotation.set(this.rotation() + this.wheelDegPerSec * dt);

      if (this.ballAttached()) {
        // Ball ist „eingeschnappt“ und dreht mit dem Rad mit
        this.ballAngle.set(this.mod(this.rotation() + this.lockOffset, 360));
      } else if (this.ballMoving()) {
        // Freilaufender Ball mit linearer Bremsung
        let omega = this.ballOmega + this.ballDecel * dt;
        if (omega <= 0) {
          // Statt stehen zu bleiben -> an Rad koppeln
          this.attachBallToPocket();
          omega = 0;
          this.ballMoving.set(false);
        } else {
          this.ballAngle.set(this.mod(this.ballAngle() - omega * dt, 360)); // CCW gegen das Rad
          this.ballOmega = omega;
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  launchBall() {
    if (this.ballMoving()) return;
    this.ballAttached.set(false);
    this.result.set(null);
    this.ballOmega = this.ballInitDegPerSec;
    this.ballMoving.set(true);
  }

  // Ball an aktuelles Fach „einhaken“ und mit dem Rad mitdrehen lassen
  private attachBallToPocket() {
    const phi = this.mod(this.ballAngle() - (this.startAngle + this.rotation()), 360);
    let idx = Math.floor(phi / this.step);
    idx = Math.max(0, Math.min(idx, this.sequence.length - 1));

    const win = this.sequence[idx];
    this.winningNumber = win;

    // Ball an Segmentmitte koppeln
    const segCenter = (idx + 0.5) * this.step;
    this.lockOffset = this.startAngle + segCenter;
    this.ballAngle.set(this.mod(this.rotation() + this.lockOffset, 360));
    this.ballAttached.set(true);
    this.ballMoving.set(false);

    // Spin beenden
    this.ballLanded = true;
    this.spinning = false;

    // Gewinn/Verlust berechnen
    const color  = this.colorOf(win);
    const gross  = this.computePayout(win, color);          // Bruttogewinn (0, 2x, 3x, 36x)
    const net    = gross - this.activeBetAmount;            // Netto: Gewinn minus Einsatz

    // Store einmalig updaten (Netto)
    this.store.dispatch(GameActions.rouletteResult({
      winningNumber: win,
      color,
      payout: net
    }));

    // UI-Text
    this.resultMessage = gross > 0
        ? `Gewonnen! Zahl: ${win} (${color}).`
        : `Verloren! Zahl: ${win} (${color}).`;
  }



  // --- Darstellung ---
  bg = computed(() => {
    const parts: string[] = [];
    for (let i = 0; i < this.wheel.length; i++) {
      const a0 = i * this.step;
      const a1 = (i + 1) * this.step;
      const col = this.wheel[i].color === 'red' ? '#ef4444'
          : this.wheel[i].color === 'black' ? '#111' : '#059669';
      parts.push(`${col} ${a0}deg ${a1}deg`);
    }
    return `conic-gradient(from ${this.startAngle}deg, ${parts.join(',')})`;
  });

  readonly labelRadius = 135;

  labelTransform(i: number): string {
    const angle = this.startAngle + (i + 0.5) * this.step;
    return `translate(-50%, -50%) rotate(${angle}deg) translateY(-${this.labelRadius}px) rotate(180deg)`;
  }


  colorOf(n: number): 'red' | 'black' | 'green' {
    if (n === 0) return 'green';
    return this.redSet.has(n) ? 'red' : 'black';
  }

  // --- Utils ---
  private mod(a: number, n: number): number { return ((a % n) + n) % n; }

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private store: Store<AppState>) {}



  ngOnInit(): void {
    this.sub = this.balance$.subscribe(bal => (this.currentBalance = bal));
  }

  isRedNumber(n: number): boolean {
    return this.redSet.has(n);
  }

  isBlackNumber(n: number): boolean {
    return n !== 0 && !this.redSet.has(n);
  }

  allIn(balance: number): void {
    if (this.spinning) return;
    this.bet = Math.max(this.minBet, balance);
    this.spin();
  }

  onBetTypeChange(type: string): void {
    this.betType = type;
    switch (type) {
      case 'color': this.betValue = 'red'; break;
      case 'number': this.betValue = 0; break;
      case 'even':
      case 'odd':
      case 'dozen1':
      case 'dozen2':
      case 'dozen3': this.betValue = ''; break;
    }
  }

  spin(): void {
    if (this.spinning) return;

    const betAmount = Math.max(this.minBet, this.bet);
    this.bet = betAmount;
    this.activeBetAmount = betAmount;

    this.spinning = true;
    this.ballLanded = false;
    this.winningNumber = null;
    this.resultMessage = '';

    this.launchBall();
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
    if (this.resultMessage.includes('Gewonnen')) return 'winning';
    if (this.resultMessage.includes('Verloren')) return 'losing';
    return '';
  }

  isWinning(): boolean {
    return this.resultMessage.includes('Gewonnen');
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

  private computePayout(win: number, color: 'red' | 'black' | 'green'): number {
    const betAmount = this.activeBetAmount || this.bet;
    if (!betAmount) return 0;

    switch (this.betType) {
      case 'number': {
        const target = Number(this.betValue);
        if (win === target) return betAmount * 36; // 35:1 + Einsatz
        return 0;
      }
      case 'color': {
        if (win === 0) return 0;
        if (typeof this.betValue === 'string' && this.betValue === color) return betAmount * 2; // 1:1 + Einsatz
        return 0;
      }
      case 'even': {
        if (win !== 0 && win % 2 === 0) return betAmount * 2;
        return 0;
      }
      case 'odd': {
        if (win !== 0 && win % 2 === 1) return betAmount * 2;
        return 0;
      }
      case 'dozen1': { // 1–12
        if (win >= 1 && win <= 12) return betAmount * 3; // 2:1 + Einsatz
        return 0;
      }
      case 'dozen2': { // 13–24
        if (win >= 13 && win <= 24) return betAmount * 3;
        return 0;
      }
      case 'dozen3': { // 25–36
        if (win >= 25 && win <= 36) return betAmount * 3;
        return 0;
      }
      default:
        return 0;
    }
  }
}
