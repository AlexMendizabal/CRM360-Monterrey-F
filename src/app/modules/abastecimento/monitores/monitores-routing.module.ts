import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { AbastecimentoPainelEstoqueComponent } from './painel-estoque/painel-estoque.component';
import { AbastecimentoMonitoresComponent } from './monitores.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoMonitoresComponent
      },
      {
        path: 'painel-estoque',
        component: AbastecimentoPainelEstoqueComponent
      },
      {
        path: 'analise-compras',
        loadChildren: () =>
          import('./analise-compras/analise-compras.module').then(
            m => m.AbastecimentoMonitoresAnaliseComprasModule
          )
      },
      {
        path: 'analise-compras-multi-visoes',
        loadChildren: () =>
          import('./analise-compras-multi-visoes/analise-compras-multi-visoes.module').then(
            m => m.AbastecimentoMonitoresAnaliseComprasMultiVisoesModule
          )
      },
      {
        path: 'integracao-pedidos',
        loadChildren: () =>
          import('./integracao-pedidos/integracao-pedidos.module').then(
            m => m.AbastecimentoMonitoresIntegracaoPedidosModule
          )
      },
      {
        path: 'nfe-sem-pedido-pai',
        loadChildren: () =>
          import('./nfe-sem-pedido-pai/nfe-sem-pedido-pai.module').then(
            m => m.AbastecimentoMonitoresNfeSemPedidoPaiModule
          )
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoMonitoresRoutingModule { }
