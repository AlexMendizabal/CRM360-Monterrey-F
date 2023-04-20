import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsTurnosCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsTurnosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsTurnosListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsTurnosCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsTurnosCadastroComponent,
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
export class LogisticaYmsTurnosRoutingModule {}
