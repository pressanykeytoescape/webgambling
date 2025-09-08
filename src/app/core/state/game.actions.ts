import { createAction, props } from '@ngrx/store';

/**
 * Shared actions for game state management.
 */
export const deposit = createAction('[Lobby] Deposit', props<{ amount: number }>());

export const updateSettings = createAction(
  '[Lobby] Update Settings',
  props<{ sound: boolean; animations: boolean }>()
);

// Slots actions
export const slotsSpin = createAction('[Slots] Spin', props<{ bet: number }>());
export const slotsSpinResult = createAction(
  '[Slots] Spin Result',
  props<{ symbols: string[][]; payout: number }>()
);

// Blackjack actions
export const blackjackDeal = createAction('[Blackjack] Deal', props<{ bet: number }>());
export const blackjackResult = createAction('[Blackjack] Result', props<{ payout: number }>());

// Roulette actions
export const rouletteSpin = createAction(
  '[Roulette] Spin',
  props<{ betAmount: number; betType: string; betValue?: number | string }>()
);
export const rouletteResult = createAction(
  '[Roulette] Result',
  props<{ winningNumber?: number; color?: 'red' | 'black' | 'green'; payout: number }>()
);

// Generic balance update in case features need to update without specifying game
export const updateBalance = createAction('[Game] Update Balance', props<{ delta: number }>());

export type GameActionsUnion =
  | ReturnType<typeof deposit>
  | ReturnType<typeof updateSettings>
  | ReturnType<typeof slotsSpin>
  | ReturnType<typeof slotsSpinResult>
  | ReturnType<typeof blackjackDeal>
  | ReturnType<typeof blackjackResult>
  | ReturnType<typeof rouletteSpin>
  | ReturnType<typeof rouletteResult>
  | ReturnType<typeof updateBalance>;