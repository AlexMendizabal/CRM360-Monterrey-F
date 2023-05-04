import { SulFluminensePainelDecisaoAbastecimentoComponent } from './painel-decisao-abastecimento/painel-decisao-abastecimento.component';

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { SulFluminenseDistribuicaoComponent } from './distribuicao.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SulFluminenseDistribuicaoComponent
      },
      {
        path: 'painel-decisao-abastecimento',
        component: SulFluminensePainelDecisaoAbastecimentoComponent
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SulFluminenseDistribuicaoRoutingModule { }
