import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminUsuariosListaComponent } from './lista/lista.component';
import { AdminUsuariosCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUsuariosListaComponent
  },
  {
    path: 'novo',
    component: AdminUsuariosCadastroComponent
  },
  {
    path: ':id',
    component: AdminUsuariosCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminUsuariosRoutingModule { }
