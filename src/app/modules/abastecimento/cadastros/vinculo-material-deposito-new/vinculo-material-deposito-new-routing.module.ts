import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Componentes
import { AbastecimentoCadastrosVinculoMaterialDepositoListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosVinculoMaterialDepositoListaNaoVinculadosComponent } from './lista-nao-vinculados/lista-nao-vinculados.component';
import { AbastecimentoCadastrosVinculoMaterialDepositoCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosVinculoMaterialDepositoListaComponent
      },
      {
        path: 'lista-nao-vinculados',
        component: AbastecimentoCadastrosVinculoMaterialDepositoListaNaoVinculadosComponent
      },
      {
        path: 'cadastro',
        component: AbastecimentoCadastrosVinculoMaterialDepositoCadastroComponent
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
export class AbastecimentoCadastrosVinculoMaterialDepositoNewRoutingModule { }
