import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialGestaoRankingClientesFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialGestaoRankingClientesListaComponent } from './lista/lista.component';
import { ComercialGestaoRankingClientesFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialGestaoRankingClientesListaComponent,
  },
  {
    path: 'novo',
    component: ComercialGestaoRankingClientesFormularioComponent,
    resolve: {
      detalhes: ComercialGestaoRankingClientesFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialGestaoRankingClientesFormularioComponent,
    resolve: {
      detalhes: ComercialGestaoRankingClientesFormularioResolverGuard,
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
  exports: [RouterModule],
})
export class ComercialGestaoRankingClientesRoutingModule {}