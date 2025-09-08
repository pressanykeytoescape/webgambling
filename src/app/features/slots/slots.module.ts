import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SlotsComponent } from './slots.component';
import { ReelComponent } from './reel/reel.component';

const routes: Routes = [
  { path: '', component: SlotsComponent }
];

@NgModule({
  declarations: [SlotsComponent, ReelComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class SlotsModule {}