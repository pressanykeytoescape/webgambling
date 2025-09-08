import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';

export interface GameState {
  balance: number;
  settings: {
    sound: boolean;
    animations: boolean;
  };
}

const DEFAULT_BALANCE = 1000;

/**
 * Retrieve persisted state from localStorage if available.  This allows the user
 * to refresh the page and keep their balance and settings.  If parsing fails
 * or nothing is stored, fall back to sensible defaults.
 */
function loadInitialState(): GameState {
  if (typeof window !== 'undefined') {
    try {
      const persisted = localStorage.getItem('funCasinoState');
      if (persisted) {
        const obj = JSON.parse(persisted);
        if (obj.game) {
          return obj.game as GameState;
        }
      }
    } catch {
      // ignore parsing errors
    }
  }
  return {
    balance: DEFAULT_BALANCE,
    settings: {
      sound: true,
      animations: true
    }
  };
}

export const initialState: GameState = loadInitialState();

export const reducer = createReducer(
  initialState,
  on(GameActions.deposit, (state, { amount }) => ({ ...state, balance: amount })),
  on(GameActions.updateSettings, (state, { sound, animations }) => ({
    ...state,
    settings: { sound, animations }
  })),
  on(GameActions.updateBalance, (state, { delta }) => ({ ...state, balance: state.balance + delta })),
  on(GameActions.slotsSpin, (state, { bet }) => ({ ...state, balance: state.balance - bet })),
  on(GameActions.slotsSpinResult, (state, { payout }) => ({ ...state, balance: state.balance + payout })),
  on(GameActions.blackjackDeal, (state, { bet }) => ({ ...state, balance: state.balance - bet })),
  on(GameActions.blackjackResult, (state, { payout }) => ({ ...state, balance: state.balance + payout })),
  on(GameActions.rouletteSpin, (state, { betAmount }) => ({ ...state, balance: state.balance - betAmount })),
  on(GameActions.rouletteResult, (state, { payout }) => ({ ...state, balance: state.balance + payout }))
);