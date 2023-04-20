import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsAssociacaoEtapasCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsAssociacaoEtapasListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsAssociacaoEtapasListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsAssociacaoEtapasCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsAssociacaoEtapasCadastroComponent,
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
export class LogisticaYmsAssociacaoEtapasRoutingModule {}
