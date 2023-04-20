import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoComponent } from './estoque-de-faturamento.component';


const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoRoutingModule { }
