import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCicloVendasCotacoesListaProfilesResolverGuard } from './lista/guards/profile-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioClienteResolverGuard } from './formulario/guards/cliente-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioDataResolverGuard } from './formulario/guards/data-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard } from './formulario/guards/permissoes-resolver.guard';
import { ComercialCicloVendasCotacoesFormularioProfilesResolverGuard } from './formulario/guards/profile-resolver.guard';
import { ComercialCicloVendasCotacoesListaFinalizacaoResolverGuard } from './lista/guards/finalizacao-resolver.guard';

// Modules
import { ComercialCicloVendasCotacoesListaModule } from './lista/lista.module';
import { ComercialCicloVendasCotacoesFormularioModule } from './formulario/formulario.module';

// Components
import { ComercialCicloVendasCotacoesListaComponent } from './lista/lista.component';
import { ComercialCicloVendasCotacoesFormularioComponent } from './formulario/formulario.component';
import { ModalAutorizacionComponent } from './lista/modal-autorizacion/modal-autorizacion.component';
import { VistaComponent } from './lista/vista/vista.component';


const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCicloVendasCotacoesListaComponent,
    resolve: {
      profile: ComercialCicloVendasCotacoesListaProfilesResolverGuard,
    },
  },
  {
    path: 'lista/:codCotacao/:codEmpresa',
    component: ComercialCicloVendasCotacoesListaComponent,
    resolve: {
      data: ComercialCicloVendasCotacoesListaFinalizacaoResolverGuard,
      profile: ComercialCicloVendasCotacoesListaProfilesResolverGuard
    },
  },
  {
    path: 'novo/:idReservado/:codEmpresa',
    component: ComercialCicloVendasCotacoesFormularioComponent,
    resolve: {
      cliente: ComercialCicloVendasCotacoesFormularioClienteResolverGuard,
      data: ComercialCicloVendasCotacoesFormularioDataResolverGuard,
      permissoes: ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard,
      profile: ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'novo/:idReservado',
    component: ComercialCicloVendasCotacoesFormularioComponent,
    resolve: {
      cliente: ComercialCicloVendasCotacoesFormularioClienteResolverGuard,
      data: ComercialCicloVendasCotacoesFormularioDataResolverGuard,
      permissoes: ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard,
      profile: ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '/nuevo',
    component: ComercialCicloVendasCotacoesListaComponent
  },
  {
    path: 'editar/:codCotacao/:idEmpresa',
    component: ComercialCicloVendasCotacoesFormularioComponent,
    resolve: {
      cliente: ComercialCicloVendasCotacoesFormularioClienteResolverGuard,
      data: ComercialCicloVendasCotacoesFormularioDataResolverGuard,
      permissoes: ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard,
      profile: ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'visualizar/:codCotacao/:idEmpresa',
    component: ComercialCicloVendasCotacoesFormularioComponent,
    resolve: {
      cliente: ComercialCicloVendasCotacoesFormularioClienteResolverGuard,
      data: ComercialCicloVendasCotacoesFormularioDataResolverGuard,
      permissoes: ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard,
      profile: ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
    children: [
      {
        path: 'modal-autorizacion',
        component: ModalAutorizacionComponent,
        pathMatch: 'full',
      },
    ]
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
    children: [
      {
        path: 'vista/:id_oferta',
        component: VistaComponent,
        pathMatch: 'full',
      },
    ]
  }

];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ComercialCicloVendasCotacoesListaModule,
    ComercialCicloVendasCotacoesFormularioModule,
  ],
  exports: [RouterModule],
})
export class ComercialCicloVendasAutorizacionesRoutingModule { }
