import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaTipoVeiculoCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaTipoVeiculoListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaTipoVeiculoListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaTipoVeiculoCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaTipoVeiculoCadastroComponent,
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
export class LogisticaTipoVeiculoRoutingModule {}
