import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista.component';
import { FormularioComponent } from './formulario/formulario.component';

//Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCicloVendasCotacoesFormularioClienteResolverGuard } from './formulario/guards/cliente-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard } from './formulario/guards/permissoes-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioProfilesResolverGuard } from './formulario/guards/profile-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioDataResolverGuard } from './formulario/guards/data-resolver.guard';

const routes: Routes = [
  {
    path: 'lista',
    component: ListaComponent,
  },
  {
     path: 'registrar',
     component: FormularioComponent,
     resolve: {
      cliente: ComercialCicloVendasCotacoesFormularioClienteResolverGuard,
      data: ComercialCicloVendasCotacoesFormularioDataResolverGuard,
      permissoes: ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard,
      profile: ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
      },
     canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:codOferta',
    component: FormularioComponent,
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
export class OfertasRoutingModule { }
