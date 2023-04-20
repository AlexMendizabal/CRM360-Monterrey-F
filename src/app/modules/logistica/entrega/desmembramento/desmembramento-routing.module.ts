import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { LogisticaEntregaDesmembramentoComponent } from './desmembramento.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEntregaDesmembramentoComponent
  }
];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class LogisticaEntregaDesmembramentoRoutingModule { }
  