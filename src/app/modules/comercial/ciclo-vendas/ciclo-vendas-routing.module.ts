import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialCicloVendasComponent } from './ciclo-vendas.component';

const routes: Routes = [
  {
    path: ':idSubModulo',
    children: [
      {
        path: '',
        component: ComercialCicloVendasComponent,
      },
      {
        path: 'autorizaciones',
        loadChildren: () =>
          import('./autorizaciones/autorizaciones.module').then(
            (m) => m.ComercialCicloVendasAutorizacionesModule
      ),
      },
      {
        path: 'cotacoes-pedidos',
        loadChildren: () =>
          import('./cotacoes/cotacoes.module').then(
            (m) => m.ComercialCicloVendasCotacoesModule
          ),
      },
      {
        path: 'pedidos-producao-telas',
        loadChildren: () =>
          import('./pedidos-producao-telas/pedidos-producao-telas.module').then(
            (m) => m.ComercialCicloVendasPedidosProducaoTelasModule
          ),
      },
      {
        path: 'painel-bobinas',
        loadChildren: () =>
          import('./painel-bobinas/painel-bobinas.module').then(
            (m) => m.ComercialPainelBobinasModule
          ),
      },
      {
        path: 'contato',
        redirectTo: '/comercial/agenda/novo',
      },
      {
        path: 'clientes',
        redirectTo: '/comercial/clientes/lista',
      },
      {
        path: 'reporte',
        redirectTo: '/comercial/reporte',
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialCicloVendasRoutingModule {}
