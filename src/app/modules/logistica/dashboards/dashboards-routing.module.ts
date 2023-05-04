import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaDashboardsComponent } from './dashboards.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaDashboardsComponent
  },
  {
    path: 'conferencia-cte',
    loadChildren: () => import('./conferencia-cte/conferencia-cte.module').then((m) => m.LogisticaDashboardsConferenciaCteModule)
  },
  {
    path: 'gestao-carteira',
    loadChildren: () => import('./gestao-carteira/gestao-carteira.module').then((m) => m.LogisticaDashboardsGestaoCarteiraModule)
  },
  {
    path: 'faturamento-financeiro',
    loadChildren: () => import('./faturamento-financeiro/faturamento-financeiro.module').then((m) => m.LogisticaDashboardsFaturamentoFinanceiroModule)
  },
  {
    path: 'analise-frete',
    loadChildren: () => import('./analise-frete/analise-frete.module').then((m) => m.LogisticaDashboardsAnaliseFreteModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
]

@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})
export class LogisticaDashboardsRoutingModule{}