import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// Core state management
import { reducers, metaReducers } from './core/state';
import { GameEffects } from './core/state/game.effects';

// Feature modules
import { LobbyModule } from './features/lobby/lobby.module';
import { SlotsModule } from './features/slots/slots.module';
import { BlackjackModule } from './features/blackjack/blackjack.module';
import { RouletteModule } from './features/roulette/roulette.module';

const routes: Routes = [
  { path: '', redirectTo: 'lobby', pathMatch: 'full' },
  { path: 'lobby', loadChildren: () => import('./features/lobby/lobby.module').then((m) => m.LobbyModule) },
  { path: 'slots', loadChildren: () => import('./features/slots/slots.module').then((m) => m.SlotsModule) },
  { path: 'blackjack', loadChildren: () => import('./features/blackjack/blackjack.module').then((m) => m.BlackjackModule) },
  { path: 'roulette', loadChildren: () => import('./features/roulette/roulette.module').then((m) => m.RouletteModule) },
  { path: '**', redirectTo: 'lobby' }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([GameEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    LobbyModule,
    SlotsModule,
    BlackjackModule,
    RouletteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}