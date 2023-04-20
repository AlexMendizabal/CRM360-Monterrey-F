import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsAssociacaoMateriaisCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsAssociacaoMateriaisListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsAssociacaoMateriaisListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsAssociacaoMateriaisCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsAssociacaoMateriaisCadastroComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticaYmsAssociacaoMateriaisRoutingModule {}
