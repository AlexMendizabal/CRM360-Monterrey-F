import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SulFluminenseHomeComponent } from './home.component';

const routes: Routes = [{ path: '', component: SulFluminenseHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseHomeRoutingModule { }
