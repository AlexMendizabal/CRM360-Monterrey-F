import { LogisticaYmsEtapasAssociacaoSetoresComponent } from './associacao-setores/associacao-setores.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsEtapasCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsEtapasListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsEtapasListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsEtapasCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsEtapasCadastroComponent,
  },
  {
    path: 'setores/:id',
    component: LogisticaYmsEtapasAssociacaoSetoresComponent,
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
export class LogisticaYmsEtapasRoutingModule {}
