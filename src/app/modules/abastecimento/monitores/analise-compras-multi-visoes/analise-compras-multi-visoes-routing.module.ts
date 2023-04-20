import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoMonitoresAnaliseComprasMultiVisoesComponent } from './analise-compras-multi-visoes.component';

const routes: Routes = [
  {
    path: '',
    component: AbastecimentoMonitoresAnaliseComprasMultiVisoesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesRoutingModule { }
