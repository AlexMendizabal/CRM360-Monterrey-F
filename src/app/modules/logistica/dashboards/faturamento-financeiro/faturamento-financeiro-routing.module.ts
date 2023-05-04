import { NgModule } from '@angular/core';
import {RouterModule, Routes } from '@angular/router'

import { LogisticaDashboardsFaturamentoFinanceiroComponent } from './faturamento-financeiro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsFaturamentoFinanceiroComponent
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})
export class LogisticaDashboadsFaturamentoFinanceiroRoutingModule{}