import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsTiposSetorCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsTiposSetorListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsTiposSetorListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsTiposSetorCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsTiposSetorCadastroComponent,
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
export class LogisticaYmsTiposSetorRoutingModule {}
