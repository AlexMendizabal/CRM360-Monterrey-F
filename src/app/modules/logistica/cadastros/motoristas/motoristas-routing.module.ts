import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaMotoristasCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaMotoristasListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaMotoristasListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaMotoristasCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaMotoristasCadastroComponent,
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
export class LogisticaMotoristasRoutingModule {}
