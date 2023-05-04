import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router'

import { LogisticaDashboardsConferenciaCteComponent } from './conferencia-cte.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsConferenciaCteComponent
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})
export class LogisticaDashboadsConferenciaCteRoutingModule{}