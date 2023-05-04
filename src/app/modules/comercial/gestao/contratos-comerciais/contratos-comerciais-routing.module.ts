import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialoGestaoContratosComerciaisFormularioResolverGuard } from './guards/formulario-resolver.guard';
import { ComercialGestaoContratosComerciaisListaComponent } from './lista/lista.component';

// Components

import { ComercialGestaoContratosComerciaisFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialGestaoContratosComerciaisListaComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
      {
        path: 'novo',
        component: ComercialGestaoContratosComerciaisFormularioComponent,
        resolve: {
          detalhes: ComercialoGestaoContratosComerciaisFormularioResolverGuard,
        },
      },
      {
        path: 'editar/:id',
        component: ComercialGestaoContratosComerciaisFormularioComponent,
        resolve: {
          detalhes: ComercialoGestaoContratosComerciaisFormularioResolverGuard,
        },
      },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialGestaoContratosComerciaisRoutingModule {}
