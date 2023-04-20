import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaTransportadorasCadastroComponent } from './cadastro/cadastro.component';
import { LotisticaTransportadorasListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LotisticaTransportadorasListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaTransportadorasCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaTransportadorasCadastroComponent,
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
export class LogisticaTransportadorasRoutingModule {}
