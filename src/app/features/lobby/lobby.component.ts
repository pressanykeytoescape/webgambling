import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../core/state';
import * as GameSelectors from '../../core/state/game.selectors';
import * as GameActions from '../../core/state/game.actions';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  balance$: Observable<number>;
  settings$: Observable<{ sound: boolean; animations: boolean }>;
  showSettings = false;

  constructor(private store: Store<AppState>) {
    this.balance$ = this.store.select(GameSelectors.selectBalance);
    this.settings$ = this.store.select(GameSelectors.selectSettings);
  }

  deposit(): void {
    // Deposit resets the balance to the default value
    this.store.dispatch(GameActions.deposit({ amount: 1000 }));
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  updateSettings(sound: boolean, animations: boolean): void {
    this.store.dispatch(GameActions.updateSettings({ sound, animations }));
  }

  onSoundToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settings$.subscribe(settings => {
      this.updateSettings(checked, settings?.animations || false);
    }).unsubscribe();
  }

  onAnimationToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settings$.subscribe(settings => {
      this.updateSettings(settings?.sound || false, checked);
    }).unsubscribe();
  }
}