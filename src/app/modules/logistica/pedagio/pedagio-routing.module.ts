import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaPedagioListaComponent } from './lista/lista.component';
import { LogisticaPedagioCadastroComponent } from './cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaPedagioListaComponent
  },
  {
    path: ':id',
    component: LogisticaPedagioCadastroComponent
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
export class LogisticaPedagioRoutingModule { }