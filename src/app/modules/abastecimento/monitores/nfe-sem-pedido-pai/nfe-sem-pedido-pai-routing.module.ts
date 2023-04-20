import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoMonitoresNfeSemPedidoPaiComponent } from './nfe-sem-pedido-pai.component';


const routes: Routes = [
  {
    path: '',
    component: AbastecimentoMonitoresNfeSemPedidoPaiComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoMonitoresNfeSemPedidoPaiRoutingModule { }
