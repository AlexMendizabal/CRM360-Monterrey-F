import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosMediaVendasListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosMediaVendasCadastroComponent } from './cadastro/cadastro.component';
import { AbastecimentoCadastrosMediaVendasEditaComponent } from './edita/edita.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosMediaVendasListaComponent
      },
      {
        path: 'cadastro',
        component: AbastecimentoCadastrosMediaVendasCadastroComponent
      },
      {
        path: 'edita',
        component: AbastecimentoCadastrosMediaVendasEditaComponent
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastroMediaVendasRoutingModule { }
