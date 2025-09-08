import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BlackjackComponent } from './blackjack.component';

const routes: Routes = [
  { path: '', component: BlackjackComponent }
];

@NgModule({
  declarations: [BlackjackComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class BlackjackModule {}