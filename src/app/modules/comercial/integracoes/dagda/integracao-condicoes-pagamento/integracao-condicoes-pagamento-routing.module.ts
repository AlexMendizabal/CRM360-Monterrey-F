import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '../../../../../core/not-found/not-found.component';

import { ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoListaComponent } from './lista/lista.component';
import { ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    component:
      ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoListaComponent,
  },
  {
    path: 'novo',
    component:
      ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent,
  },
  {
    path: ':id',
    component:
      ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent,
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
export class ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoRoutingModule {}
