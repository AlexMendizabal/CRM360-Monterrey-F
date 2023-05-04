import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { LogisticaRestricoesTransporteCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaRestricoesTransporteListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaRestricoesTransporteListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaRestricoesTransporteCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaRestricoesTransporteCadastroComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaRestricoesTransporteRoutingModule { }
