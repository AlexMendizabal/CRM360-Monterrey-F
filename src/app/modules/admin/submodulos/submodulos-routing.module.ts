import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminSubModulosCadastroComponent } from './cadastro/cadastro.component';
import { AdminSubModulosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSubModulosListaComponent
  },
  {
    path: 'novo',
    component: AdminSubModulosCadastroComponent
  },
  {
    path: ':id',
    component: AdminSubModulosCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSubmodulosRoutingModule { }
