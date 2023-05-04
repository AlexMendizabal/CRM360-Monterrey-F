import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaVeiculosCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaVeiculosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaVeiculosListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaVeiculosCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaVeiculosCadastroComponent,
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
export class LogisticaVeiculosRoutingModule {}
