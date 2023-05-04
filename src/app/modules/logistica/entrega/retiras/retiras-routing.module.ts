import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogisticaEntregaRetirasCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaEntregaRetirasListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEntregaRetirasListaComponent
  },
  {
    path: 'novo',
    component: LogisticaEntregaRetirasCadastroComponent
  },
  {
    path: ':id',
    component: LogisticaEntregaRetirasCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaEntregaRetirasRoutingModule { }
