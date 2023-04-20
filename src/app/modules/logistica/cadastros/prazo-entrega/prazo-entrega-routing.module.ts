import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaPrazoEntregaListaComponent } from './lista/lista.component';
import { LogisticaPrazoEntregaCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaPrazoEntregaListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaPrazoEntregaCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaPrazoEntregaCadastroComponent,
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
export class LogisticaPrazoEntregaRoutingModule { }
