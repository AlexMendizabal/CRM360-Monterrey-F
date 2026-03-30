import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {  ComercialCadastrosCampanhasListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';
// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
const routes: Routes = [
  {
    path: 'lista', component: ComercialCadastrosCampanhasListaComponent
  },
  {
    path: 'novo',
    component: FormularioComponent,
    resolve: {
    /*   detalhes: ComercialCadastrosMateriaisCrossSellFormularioResolverGuard, */
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampanhasRoutingModule { }

