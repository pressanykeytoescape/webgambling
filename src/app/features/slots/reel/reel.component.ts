import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * A reel displays a vertical list of symbols.  On change of `symbols` input
 * the component triggers a simple CSS animation (translateY) to simulate a
 * spinning reel.  Because full GSAP animations would require significant
 * overhead, this component uses CSS transitions for performance.
 */
@Component({
  selector: 'app-reel',
  templateUrl: './reel.component.html',
  styleUrls: ['./reel.component.css']
})
export class ReelComponent implements OnChanges {
  @Input() symbols: string[] = [];
  @Input() spinning = false;
  @Input() reelIndex = 0;

  // Used to trigger CSS animation on symbol change
  isAnimating = false;
  isWinningReel = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['symbols'] && !changes['symbols'].firstChange) {
      this.isAnimating = true;
      setTimeout(() => (this.isAnimating = false), 1000 + (this.reelIndex * 200));
    }
  }

  getExtendedSymbols(): string[] {
    // Verwende nur die Symbole der aktuellen Runde für die Animation
    // (optional: für Animation kann man die aktuelle Spalte mehrfach aneinanderhängen)
    return [...this.symbols, ...this.symbols, ...this.symbols];
  }

  isWinningSymbol(symbol: string, index: number): boolean {
    // Highlight winning symbols (simplified logic)
    return this.isWinningReel && index >= this.getExtendedSymbols().length - 6 && index < this.getExtendedSymbols().length - 3;
  }
}