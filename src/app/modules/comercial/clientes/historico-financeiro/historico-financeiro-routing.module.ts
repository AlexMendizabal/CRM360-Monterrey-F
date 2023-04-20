import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { ComercialClientesResolverGuard } from '../clientes-resolver.guard';

// Components
import { ComercialClientesHistoricoFinanceiroComponent } from './historico-financeiro.component';
import { ComercialClientesHistoricoFinanceiroResumoComponent } from './resumo/resumo.component';
import { ComercialClientesHistoricoFinanceiroDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialClientesHistoricoFinanceiroMateriaisDuplicataComponent } from './materiais-duplicata/materiais-duplicata.component';
import { ComercialClientesHistoricoFinanceiroAcumulosMensaisComponent } from './acumulos-mensais/acumulos-mensais.component';
import { ComercialClientesHistoricoFinanceiroNotasPromissoriasComponent } from './notas-promissorias/notas-promissorias.component';
import { ComercialClientesHistoricoFinanceiroDebitosComponent } from './debitos/debitos.component';
import { ComercialClientesHistoricoFinanceiroCorteDobraComponent } from './corte-dobra/corte-dobra.component';

const routes: Routes = [
  {
    path: ':id',
    component: ComercialClientesHistoricoFinanceiroComponent,
    resolve: {
      response: ComercialClientesResolverGuard
    },
    children: [
      { path: '', redirectTo: 'resumo', pathMatch: 'full' },
      {
        path: 'resumo',
        component: ComercialClientesHistoricoFinanceiroResumoComponent
      },
      {
        path: 'detalhes',
        component: ComercialClientesHistoricoFinanceiroDetalhesComponent
      },
      {
        path: 'materiais-duplicata',
        component: ComercialClientesHistoricoFinanceiroMateriaisDuplicataComponent
      },
      {
        path: 'acumulos-mensais',
        component: ComercialClientesHistoricoFinanceiroAcumulosMensaisComponent
      },
      {
        path: 'notas-promissorias',
        component: ComercialClientesHistoricoFinanceiroNotasPromissoriasComponent
      },
      {
        path: 'debitos',
        component: ComercialClientesHistoricoFinanceiroDebitosComponent
      },
      {
        path: 'corte-dobra',
        component: ComercialClientesHistoricoFinanceiroCorteDobraComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/comercial/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialHistoricoFinanceiroRoutingModule {}
