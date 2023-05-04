import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosNivelEstoqueDepositoNewListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosNivelEstoqueDepositoNewCadastroComponent } from './cadastro/cadastro.component';




const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosNivelEstoqueDepositoNewListaComponent
      },
  
      {
        path: 'cadastro',
        component: AbastecimentoCadastrosNivelEstoqueDepositoNewCadastroComponent
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
export class AbastecimentoCadastrosNivelEstoqueDepositoNewRoutingModule { }
