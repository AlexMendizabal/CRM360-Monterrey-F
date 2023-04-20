import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsChecklistCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsChecklistListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsChecklistListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsChecklistCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsChecklistCadastroComponent,
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
export class LogisticaYmsChecklistRoutingModule {}
