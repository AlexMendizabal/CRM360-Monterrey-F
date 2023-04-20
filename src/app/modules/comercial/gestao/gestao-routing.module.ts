import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialGestaoComponent } from './gestao.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialGestaoComponent,
      },
      {
        path: 'associacoes',
        children: [
          {
            path: 'coordenadores-escritorios',
            loadChildren: () =>
              import(
                './associacoes/coordenadores-escritorios/coordenadores-escritorios.module'
              ).then(
                (m) =>
                  m.ComercialGestaoAssociacioesCoordenadoresEscritoriosModule
              ),
          },
        ],
      },
      {
        path: 'contratos-comerciais',
        loadChildren: () =>
          import('./contratos-comerciais/contratos-comerciais.module').then(
            (m) => m.ComercialGestaoContratosComerciaisModule
          ),
      },
      {
        path: 'liberacoes',
        loadChildren: () =>
          import('./liberacoes/liberacoes.module').then(
            (m) => m.ComercialGestaoLiberacoesModule
          ),
      },
      {
        path: 'tabela-precos',
        loadChildren: () =>
          import('./tabela-precos/tabela-precos.module').then(
            (m) => m.ComercialGestaoTabelaPrecosModule
          ),
      },
      {
        path: 'ranking-clientes',
        loadChildren: () =>
          import('./ranking-clientes/ranking-clientes.module').then(
            (m) => m.ComercialGestaoRankingClientesModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialGestaoRoutingModule {}
