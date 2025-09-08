import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './index';
import { GameState } from './game.reducer';

export const selectGameState = createFeatureSelector<AppState, GameState>('game');

export const selectBalance = createSelector(selectGameState, (state) => state.balance);
export const selectSettings = createSelector(selectGameState, (state) => state.settings);
export const selectSoundEnabled = createSelector(selectSettings, (s) => s.sound);
export const selectAnimationsEnabled = createSelector(selectSettings, (s) => s.animations);