import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { SulFluminenseComponent } from './sul-fluminense.component';
import { SulFluminenseMateriaisQualidadeComponent } from './materiais-qualidade/materiais-qualidade.component';
import { SulFluminenseMateriaisRecebimentoComponent } from './materiais-recebimento/materiais-recebimento.component';

const routes: Routes = [
  {
    path: '',
    component: SulFluminenseComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module'). then(
            m => m.SulFluminenseHomeModule
          )
      },
      {
        path: 'materiais-qualidade',
        component: SulFluminenseMateriaisQualidadeComponent
      },
      {
        path: 'materiais-recebimento',
        component: SulFluminenseMateriaisRecebimentoComponent
      },
      {
        path: 'distribuicao/:idSubModulo',
        loadChildren: () =>
          import('./distribuicao/distribuicao.module'). then(
            m => m.SulFluminenseDistribuicaoModule
          )
      },
      {
        path: 'estoque-avancado/:idSubModulo',
        loadChildren: () =>
          import('./estoque-avancado/estoque-avancado.module'). then(
            m => m.SulFluminenseEstoqueAvancadoModule
          )
      },
      {
        path: 'entrada-materiais/:idSubModulo',
        loadChildren: () =>
          import('./entrada-materiais/entrada-materiais.module'). then(
            m => m.SulFluminenseEntradaMateriaisModule
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
export class SulFluminenseRoutingModule {}
