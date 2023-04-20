import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { TecnologiaInformacaoComponent } from './tecnologia-informacao.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: TecnologiaInformacaoComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then(
            (m) => m.TecnologiaInformacaoHomeModule
          ),
      },
      {
        path: 'controle-linhas',
        loadChildren: () =>
          import('./controle-linhas/controle-linhas.module').then(
            (m) => m.TecnologiaInformacaoControleLinhaModule
          ),
      },
      {
        path: 'contratos/:idSubModulo',
        loadChildren: () =>
          import('./contratos/contratos.module').then(
            (m) => m.TecnologiaInformacaoContratosModule
          ),
      },
      {
        path: 'estoque/:idSubModulo',
        loadChildren: () =>
          import('./estoque/estoque.module').then(
            (m) => m.TecnologiaInformacaoEstoqueModule
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecnologiaInformacaoRoutingModule { }
