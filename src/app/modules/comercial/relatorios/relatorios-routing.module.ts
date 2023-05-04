import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialRelatoriosComponent } from './relatorios.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialRelatoriosComponent
      },
      {
        path: 'faturamento-detalhado',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './faturamento-detalhado/faturamento-detalhado.module'
              ).then(m => m.ComercialRelatoriosFaturamentoDetalhadoModule)
          },
          {
            path: 'duque-caxias',
            loadChildren: () =>
              import(
                './faturamento-detalhado-duque/faturamento-detalhado-duque.module'
              ).then(m => m.ComercialRelatoriosFaturamentoDetalhadoDuqueModule)
          }
        ]
      },
      {
        path: 'posicao-diaria',
        loadChildren: () =>
          import('./posicao-diaria/posicao-diaria.module').then(
            m => m.ComercialRelatoriosPosicaoDiariaModule
          )
      },
      {
        path: 'comissoes-representantes',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './comissoes-representantes/comissoes-representantes.module'
              ).then(
                (m) =>
                  m.ComercialRelatoriosComissoesRepresentantesModule
              ),
          },
        ],
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialRelatoriosRoutingModule {}
