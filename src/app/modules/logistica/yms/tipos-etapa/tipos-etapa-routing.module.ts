import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaYmsTiposEtapaCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaYmsTiposEtapaListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticaYmsTiposEtapaListaComponent,
  },
  {
    path: 'novo',
    component: LogisticaYmsTiposEtapaCadastroComponent,
  },
  {
    path: ':id',
    component: LogisticaYmsTiposEtapaCadastroComponent,
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
export class LogisticaYmsTiposEtapaRoutingModule {}
