import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './../../../../../core/not-found/not-found.component';

import { ComercialIntegracoesDagdaIntegracaoMateriaisListaComponent } from './lista/lista.component';
import { ComercialIntegracoesDagdaIntegracaoMateriaisFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    component: ComercialIntegracoesDagdaIntegracaoMateriaisListaComponent,
  },
  {
    path: 'novo',
    component: ComercialIntegracoesDagdaIntegracaoMateriaisFormularioComponent,
  },
  {
    path: ':id',
    component: ComercialIntegracoesDagdaIntegracaoMateriaisFormularioComponent,
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
export class ComercialIntegracoesDagdaIntegracaoMateriaisRoutingModule {}
