import { LogisticaYmsCircuitosAssociacaoEtapasComponent } from './associacao-etapas/associacao-etapas.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsCircuitosCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsCircuitosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsCircuitosListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsCircuitosCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsCircuitosCadastroComponent,
  },
  {
    path: 'etapas/:id',
    component: LogisticaYmsCircuitosAssociacaoEtapasComponent,
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
export class LogisticaYmsCircuitosRoutingModule {}
