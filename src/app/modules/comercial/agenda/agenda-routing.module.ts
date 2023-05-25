import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialAgendaAcessosResolverGuard } from './guards/acessos-resolver.guard';
import { ComercialAgendaDetalhesResolverGuard } from './guards/detalhes-resolver.guard';

// Components
import { ComercialAgendaCompromissosComponent } from './compromissos/compromissos.component';
import { ComercialAgendaDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialAgendaFormularioComponent } from './formulario/formulario.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  { path: 'compromissos', component: ComercialAgendaCompromissosComponent },
  {
    path: 'detalhes/:id',
    component: ComercialAgendaDetalhesComponent,
    resolve: { detalhes: ComercialAgendaDetalhesResolverGuard },
  },
  {
    path: 'novo/:codCliente',
    component: ComercialAgendaFormularioComponent,
    resolve: {
      acessos: ComercialAgendaAcessosResolverGuard,
      detalhes: ComercialAgendaDetalhesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'finalizar/:id',
    component: ComercialAgendaFormularioComponent,
    resolve: {
      detalhes: ComercialAgendaDetalhesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'novo',
    component: ComercialAgendaFormularioComponent,
    resolve: {
      acessos: ComercialAgendaAcessosResolverGuard,
      detalhes: ComercialAgendaDetalhesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:id',
    component: ComercialAgendaFormularioComponent,
    resolve: {
      detalhes: ComercialAgendaDetalhesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'reagendar/:id',
    component: ComercialAgendaFormularioComponent,
    resolve: {
      detalhes: ComercialAgendaDetalhesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '',
    redirectTo: 'compromissos',
    pathMatch: 'full',
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
export class ComercialAgendaRoutingModule {}
