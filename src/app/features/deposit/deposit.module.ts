import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DepositComponent } from './deposit.component';

const routes: Routes = [
  { path: '', component: DepositComponent }
];

@NgModule({
  declarations: [DepositComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class DepositModule {}
