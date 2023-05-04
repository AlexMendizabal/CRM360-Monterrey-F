import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { TecnologiaInformacaoEstoqueComponent } from './estoque.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: TecnologiaInformacaoEstoqueComponent,
      },
      {
        path: 'nivel-estoque',
        loadChildren: () =>
          import('./nivel-estoque/nivel-estoque.module').then(
            (m) => m.TecnologiaInformacaoNivelEstoqueModule
          ),
      },
      {
        path: 'movimentacoes',
        loadChildren: () =>
          import('./movimentacoes/movimentacoes.module').then(
            (m) => m.TecnologiaInformacaoMovimentacoesModule
          ),
      },
      {
        path: 'tipo-movimentacoes',
        loadChildren: () =>
          import('./tipo-movimentacoes/tipo-movimentacoes.module').then(
            (m) => m.TecnologiaInformacaoTipoMovimentacoesModule
          ),
      },
      {
        path: 'produtos',
        loadChildren: () =>
          import('./produtos/produtos.module').then(
            (m) => m.TecnologiaInformacaoEstoqueProdutosModule
          ),
      },
      {
        path: 'tipo-produtos',
        loadChildren: () =>
          import('./tipo-produto/tipo-produto.module').then(
            (m) => m.TecnologiaInformacaoEstoqueTipoProdutosModule
          ),
      },
      {
        path: 'modelo',
        loadChildren: () =>
          import('./modelo/modelo.module').then(
            (m) => m.TecnologiaInformacaoEstoqueModeloModule
          ),
      },
      {
        path: 'marcas',
        loadChildren: () =>
          import('./marcas/marcas.module').then(
            (m) => m.TecnologiaInformacaoEstoqueMarcasModule
          ),
      },
      {
        path: 'painel-aprovacao',
        loadChildren: () =>
          import('./painel-aprovacao/painel-aprovacao.module').then(
            (m) => m.TecnologiaInformacaoEstoquePainelAprovacaoModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoEstoqueRoutingModule {}
