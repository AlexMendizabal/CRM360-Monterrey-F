import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogisticaDashboardsAnaliseFreteV1Component } from './v1.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsAnaliseFreteV1Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V1RoutingModule { }
