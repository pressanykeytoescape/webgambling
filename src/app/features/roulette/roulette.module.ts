import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RouletteComponent } from './roulette.component';

const routes: Routes = [
  { path: '', component: RouletteComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), RouletteComponent],
})
export class RouletteModule {}