import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { delay, map, concatMap, of } from 'rxjs';

import * as GameActions from './game.actions';
import { SlotsService } from '../../features/slots/slots.service';
import { RouletteService } from '../../features/roulette/roulette.service';

/**
 * Global side effects for the casino.  Currently this delegates slot spin
 * operations to the SlotsService and delays the result to simulate animation
 * duration.  Additional effects for blackjack and roulette can be added.
 */
@Injectable()
export class GameEffects {
  constructor(
    private actions$: Actions,
    private slotsService: SlotsService,
    private rouletteService: RouletteService
  ) {}

  slotsSpin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.slotsSpin),
      concatMap(({ bet }) => {
        const result = this.slotsService.spin(bet);
        return of(result).pipe(
          // Delay the result to give the UI time to animate reels
          delay(800),
          map(({ symbols, payout }) => GameActions.slotsSpinResult({ symbols, payout }))
        );
      })
    )
  );

  rouletteSpin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.rouletteSpin),
      concatMap(({ betAmount, betType, betValue }) => {
        const result = this.rouletteService.spin(betAmount, betType, betValue);
        return of(result).pipe(
          delay(800),
          map(({ winningNumber, color, payout }) =>
            GameActions.rouletteResult({ winningNumber, color, payout })
          )
        );
      })
    )
  );
}