import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SulFluminenseEstoqueAvancadoEstoquePorLoteComponent } from './estoque-por-lote.component';

const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoEstoquePorLoteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoEstoquePorLoteRoutingModule { }
