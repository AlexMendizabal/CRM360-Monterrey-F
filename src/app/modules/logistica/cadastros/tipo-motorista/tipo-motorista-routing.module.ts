import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaTipoMotoristaCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaTipoMotoristaListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaTipoMotoristaListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaTipoMotoristaCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaTipoMotoristaCadastroComponent,
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
export class LogisticaTipoMotoristaRoutingModule {}
