import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SulFluminenseEstoqueAvancadoLotesConferidosComponent } from './lotes-conferidos.component';


const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoLotesConferidosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoLotesConferidosRoutingModule { }
