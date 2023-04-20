import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosParametrosGeraisEstoqueListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosParametrosGeraisEstoqueVinculoDepositosComponent } from './vinculo-depositos/vinculo-depositos.component';
import { AbastecimentoCadastrosParametrosGeraisEstoqueDetalhesMateriaisComponent } from './detalhes-materiais/detalhes-materiais.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosParametrosGeraisEstoqueListaComponent
      },
      {
        path: 'vinculo-deposito',
        component: AbastecimentoCadastrosParametrosGeraisEstoqueVinculoDepositosComponent
      },
      {
        path: 'detalhes-materiais',
        component: AbastecimentoCadastrosParametrosGeraisEstoqueDetalhesMateriaisComponent
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
export class AbastecimentoCadastrosParametrosGeraisEstoqueRoutingModule { }
