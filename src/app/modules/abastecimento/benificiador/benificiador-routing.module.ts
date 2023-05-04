import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { AbastecimentoBenificiadorComponent } from './benificiador.component';
import { AbastecimentoPainelRecebimentoComponent } from './painel-recebimento/painel-recebimento.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoBenificiadorComponent
      },
      {
        path: 'painel-recebimento',
        component: AbastecimentoPainelRecebimentoComponent
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
export class AbastecimentoBenificiadorRoutingModule { }
