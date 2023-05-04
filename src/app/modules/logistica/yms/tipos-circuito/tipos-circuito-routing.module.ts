import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsTiposCircuitoCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsTiposCircuitoListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsTiposCircuitoListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsTiposCircuitoCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsTiposCircuitoCadastroComponent,
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
export class LogisticaYmsTiposCircuitoRoutingModule {}
