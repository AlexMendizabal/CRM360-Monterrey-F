import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SulFluminenseEstoqueAvancadoMateriaisEmLoteComponent } from './materiais-em-lote.component';


const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoMateriaisEmLoteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoMateriaisEmLoteRoutingModule { }
