import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticaDashboardsAnaliseFreteV2Component } from './v2.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsAnaliseFreteV2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V2RoutingModule { }
