import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogisticaEntregaColetasListaComponent } from './lista/lista.component';
import { LogisticaEntregaColetasCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEntregaColetasListaComponent
  },
  {
    path: 'novo',
    component: LogisticaEntregaColetasCadastroComponent
  },
  {
    path: ':id',
    component: LogisticaEntregaColetasCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaEntregaColetasRoutingModule { }
