import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogisticaRegioesEntregaCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaRegioesEntregaListaComponent } from './lista/lista.component';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaRegioesEntregaListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaRegioesEntregaCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaRegioesEntregaCadastroComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaRegioesEntregaRoutingModule { }
