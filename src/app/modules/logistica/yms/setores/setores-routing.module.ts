import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsSetoresListaComponent } from './lista/lista.component';
import { LogisticaYmsSetoresCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsSetoresAssociacaoMateriaisComponent } from './associacao-materiais/associacao-materiais.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsSetoresListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsSetoresCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsSetoresCadastroComponent,
  },
  {
    path: 'materiais/:id',
    component: LogisticaYmsSetoresAssociacaoMateriaisComponent,
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
export class LogisticaYmsSetoresRoutingModule {}
