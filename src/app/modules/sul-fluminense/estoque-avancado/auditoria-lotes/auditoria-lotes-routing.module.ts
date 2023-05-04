import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SulFluminenseEstoqueAvancadoAuditoriaLotesComponent } from './auditoria-lotes.component';

const routes: Routes = [
  {
    path: '',
    component: SulFluminenseEstoqueAvancadoAuditoriaLotesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseEstoqueAvancadoAuditoriaLotesRoutingModule { }
