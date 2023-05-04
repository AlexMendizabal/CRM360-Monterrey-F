import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaFiliaisCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaFiliaisListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaFiliaisListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaFiliaisCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaFiliaisCadastroComponent,
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
export class LogisticaFiliaisRoutingModule {}
