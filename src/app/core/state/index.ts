import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';

import * as fromGame from './game.reducer';

export interface AppState {
  game: fromGame.GameState;
}

export const reducers: ActionReducerMap<AppState> = {
  game: fromGame.reducer
};

/**
 * Meta reducer that persists the game state to localStorage on each state change.
 * This keeps the balance and settings between reloads.
 */
export function storageMetaReducer(reducer: any): any {
  return function (state: any, action: any) {
    const nextState = reducer(state, action);
    // Persist only the game slice
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('funCasinoState', JSON.stringify({ game: nextState.game }));
      } catch (e) {
        console.warn('Failed to persist state', e);
      }
    }
    return nextState;
  };
}

export const metaReducers: MetaReducer<any>[] = !environment.production
  ? [storageMetaReducer]
  : [storageMetaReducer];

export * from './game.actions';
export * from './game.selectors';