import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialDisponibilidadeMaterialFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialDisponibilidadeMaterialListaComponent } from './lista/lista.component';
import { ComercialDisponibilidadeMaterialFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'solicitacoes',
    component: ComercialDisponibilidadeMaterialListaComponent
  },
  {
    path: 'novo/:codMaterial',
    component: ComercialDisponibilidadeMaterialFormularioComponent,
    resolve: {
      detalhes: ComercialDisponibilidadeMaterialFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:codigo',
    component: ComercialDisponibilidadeMaterialFormularioComponent,
    resolve: {
      detalhes: ComercialDisponibilidadeMaterialFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: '',
    redirectTo: 'solicitacoes',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialDisponibilidadeMaterialRoutingModule {}
