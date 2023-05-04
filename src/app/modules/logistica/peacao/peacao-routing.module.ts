import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaPeacaoListaComponent } from './lista/lista.component';
import { LogisticaPeacaoCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaPeacaoListaComponent
  },
  {
    path: ':id',
    component: LogisticaPeacaoCadastroComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaPeacaoRoutingModule { }