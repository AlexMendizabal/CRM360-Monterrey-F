
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoMonitoresAnaliseComprasComponent } from './analise-compras.component';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoMonitoresAnaliseComprasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoMonitoresAnaliseComprasRoutingModule { }
