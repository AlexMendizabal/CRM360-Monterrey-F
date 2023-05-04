import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminModulosCadastroComponent } from './cadastro/cadastro.component';
import { AdminModulosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: AdminModulosListaComponent
  },
  {
    path: 'novo',
    component: AdminModulosCadastroComponent
  },
  {
    path: ':id',
    component: AdminModulosCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminModulosRoutingModule { }
