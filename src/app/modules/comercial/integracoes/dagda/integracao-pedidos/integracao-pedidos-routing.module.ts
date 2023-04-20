import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '../../../../../core/not-found/not-found.component';

import { ComercialIntegracoesDagdaIntegracaoPedidosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    component: ComercialIntegracoesDagdaIntegracaoPedidosListaComponent,
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
export class ComercialIntegracoesDagdaIntegracaoPedidosRoutingModule {}
