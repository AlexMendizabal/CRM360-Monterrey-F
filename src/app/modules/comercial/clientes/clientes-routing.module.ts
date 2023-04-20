import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialClientesCadastroDadosFaturamentoRulesResolverGuard } from './cadastro/dados-faturamento/formulario/formulario-rules-resolver.guard';
import { ComercialClientesDetalhesResolverGuard } from './detalhes/detalhes-resolver.guard';
import { ComercialClientesResolverGuard } from './clientes-resolver.guard';
import { ComercialClientesPropostaAnaliseCreditoResolverGuard } from './proposta-analise-credito/proposta-analise-credito-resolver.guard';

// Components
import { ComercialClientesListaComponent } from './lista/lista.component';
import { ComercialClientesPreCadastroComponent } from './pre-cadastro/pre-cadastro.component';
import { ComercialClientesDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialClientesDashboardComponent } from './dashboard/dashboard.component';
import { ComercialClientesPropostaAnaliseCreditoComponent } from './proposta-analise-credito/proposta-analise-credito.component';
import { ComercialClientesUltimosPrecosComponent } from './ultimos-precos/ultimos-precos.component';

const routes: Routes = [
  { path: 'lista', component: ComercialClientesListaComponent },
  {
    path: 'pre-cadastro',
    component: ComercialClientesPreCadastroComponent,
    resolve: {
      rules: ComercialClientesCadastroDadosFaturamentoRulesResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'detalhes/:id',
    component: ComercialClientesDetalhesComponent,
    resolve: {
      response: ComercialClientesDetalhesResolverGuard,
    },
  },
  {
    path: 'cadastro',
    loadChildren: () =>
      import('./cadastro/cadastro.module').then(
        (m) => m.ComercialClientesCadastroModule
      ),
  },
  {
    path: 'dashboard/:id',
    component: ComercialClientesDashboardComponent,
    resolve: {
      response: ComercialClientesResolverGuard,
    },
  },
  {
    path: 'historico-financeiro',
    loadChildren: () =>
      import('./historico-financeiro/historico-financeiro.module').then(
        (m) => m.ComercialClientesHistoricoFinanceiroModule
      ),
  },
  {
    path: 'ultimos-precos/:id',
    component: ComercialClientesUltimosPrecosComponent,
  },
  {
    path: 'proposta-analise-credito/:id',
    component: ComercialClientesPropostaAnaliseCreditoComponent,
    resolve: {
      data: ComercialClientesPropostaAnaliseCreditoResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/comercial/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialClientesRoutingModule {}
