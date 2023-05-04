import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPerfisCadastroComponent } from './cadastro/cadastro.component';
import { AdminPerfisListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPerfisListaComponent
  },
  {
    path: 'novo',
    component: AdminPerfisCadastroComponent
  },
  {
    path: ':id',
    component: AdminPerfisCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPerfisRoutingModule { }
