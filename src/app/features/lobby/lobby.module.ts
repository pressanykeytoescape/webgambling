import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { LobbyComponent } from './lobby.component';

const routes: Routes = [
  { path: '', component: LobbyComponent }
];

@NgModule({
  declarations: [LobbyComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class LobbyModule {}