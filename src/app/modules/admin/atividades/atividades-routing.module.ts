import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminAtividadesCadastroComponent } from './cadastro/cadastro.component';
import { AdminAtividadesListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAtividadesListaComponent
  },
  {
    path: 'novo',
    component: AdminAtividadesCadastroComponent
  },
  {
    path: ':id',
    component: AdminAtividadesCadastroComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAtividadesRoutingModule { }
