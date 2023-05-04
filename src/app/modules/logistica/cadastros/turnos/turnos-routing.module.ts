import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaTurnosCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaTurnosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaTurnosListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaTurnosCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaTurnosCadastroComponent,
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
export class LogisticaTurnosRoutingModule {}
