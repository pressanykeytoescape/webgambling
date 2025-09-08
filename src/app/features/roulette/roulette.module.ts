import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RouletteComponent } from './roulette.component';

const routes: Routes = [
  { path: '', component: RouletteComponent }
];

@NgModule({
  declarations: [RouletteComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class RouletteModule {}