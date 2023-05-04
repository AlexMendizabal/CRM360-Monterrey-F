import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router'

import { LogisticaDashboardsGestaoCarteiraComponent } from './gestao-carteira.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsGestaoCarteiraComponent
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})
export class LogisticaDashboadsGestaoCarteiraRoutingModule{}