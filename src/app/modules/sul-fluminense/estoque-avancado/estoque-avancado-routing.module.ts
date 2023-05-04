import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { SulFluminenseEstoqueAvancadoComponent } from './estoque-avancado.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SulFluminenseEstoqueAvancadoComponent
      },
      {
        path: 'auditoria-lotes',
        loadChildren: () =>
          import('./auditoria-lotes/auditoria-lotes.module'). then(
            m => m.SulFluminenseEstoqueAvancadoAuditoriaLotesModule
          )
      },
      {
        path: 'estoque-por-lote',
        loadChildren: () =>
          import('./estoque-por-lote/estoque-por-lote.module'). then(
            m => m.SulFluminenseEstoqueAvancadoEstoquePorLoteModule
          )
      },
      {
        path: 'estoque-de-faturamento',
        loadChildren: () =>
          import('./estoque-de-faturamento/estoque-de-faturamento.module'). then(
            m => m.SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoModule
          )
      },
      {
        path: 'materiais-em-lote',
        loadChildren: () =>
          import('./materiais-em-lote/materiais-em-lote.module'). then(
            m => m.SulFluminenseEstoqueAvancadoMateriaisEmLoteModule
          )
      },
      {
        path: 'lotes-conferidos',
        loadChildren: () =>
          import('./lotes-conferidos/lotes-conferidos.module'). then(
            m => m.SulFluminenseEstoqueAvancadoLotesConferidosModule
          )
      },
      {
        path: 'auditoria-estoque',
        loadChildren: () =>
          import('./auditoria-estoque/auditoria-estoque.module'). then(
            m => m.SulFluminenseEstoqueAvancadoAuditoriaEstoqueModule
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
export class SulFluminenseEstoqueAvancadoRoutingModule { }
