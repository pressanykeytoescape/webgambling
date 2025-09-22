import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../core/state';
import * as GameActions from '../../core/state/game.actions';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent {
  iban = '';
  accountHolder = '';
  amount: number | null = null;
  confirmation = false;

  constructor(private router: Router, private store: Store<AppState>) {}

  onSubmit(): void {
    if (this.amount && this.amount >= 10) {
      this.store.dispatch(GameActions.updateBalance({ delta: this.amount }));
      this.confirmation = true;
    }
  }

  goToLobby(): void {
    this.router.navigate(['/lobby']);
  }
}
