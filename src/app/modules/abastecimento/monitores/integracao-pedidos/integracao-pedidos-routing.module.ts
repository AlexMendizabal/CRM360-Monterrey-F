import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoMonitoresIntegracaoPedidosComponent } from './integracao-pedidos.component';


const routes: Routes = [
  {
    path: '',
    component: AbastecimentoMonitoresIntegracaoPedidosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoMonitoresIntegracaoPedidosRoutingModule { }
