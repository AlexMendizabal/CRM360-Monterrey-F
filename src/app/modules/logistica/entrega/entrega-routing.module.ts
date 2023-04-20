import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaEntregaComponent } from './entrega.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEntregaComponent
  },
  {
    path: 'coletas',
    loadChildren: () => import("./coletas/coletas.module").then( m => m.LogisticaColetasModule)
  },
  {
    path: 'retiras',
    loadChildren: () => import("./retiras/retiras.module").then( m => m.LogisticaEntregaRetirasModule)
  },
  {
    path: 'romaneios',
    loadChildren: () => import('./romaneios/romaneios.module').then( m => m.LogisticaEntregaRomaneiosModule)
  },
  {
    path: 'controle-entregas',
    loadChildren: () => import('./controle-entregas/controle-entregas.module').then( m => m.ComercialControleEntregasModule)
  },
  {
    path: 'desmembramento',
    loadChildren: () => import('./desmembramento/desmembramento.module').then( m => m.LogisticaEntregaDesmembramentoModule)
  },
  {
    path: 'monitores',
    loadChildren: () => import('./monitores/monitores.module').then( m => m.LogisticaEntregaMonitoresModule )
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaEntregaRoutingModule { }
