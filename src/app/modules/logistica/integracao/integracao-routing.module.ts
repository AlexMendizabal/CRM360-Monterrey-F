import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaIntegracaoTMSNotasFiscaisComponent } from './tms/notas-fiscais/notas-fiscais.component';

const routes: Routes = [
  {
    path: 'tms/tid/notas-fiscais',
    component: LogisticaIntegracaoTMSNotasFiscaisComponent
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
export class LogisticaIntegracaoRoutingModule { }
