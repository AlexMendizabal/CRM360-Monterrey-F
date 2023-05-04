import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SulFluminenseEstoqueAvancadoAuditoriaEstoqueComponent } from './auditoria-estoque.component';


const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoAuditoriaEstoqueComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoAuditoriaEstoqueRoutingModule { }
