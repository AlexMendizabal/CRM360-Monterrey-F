import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AbastecimentoCadastrosComponent } from './cadastros.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoCadastrosComponent
      },
      {
        path: 'vinculo-material-deposito',
        loadChildren: () =>
          import('./vinculo-material-deposito-new/vinculo-material-deposito-new.module').then(
            m => m.AbastecimentoCadastrosVinculoMaterialDepositoNewModule
          )
      },
      {
        path: 'media-vendas',
        loadChildren: () =>
          import('./media-vendas/media-vendas.module').then(
            m => m.AbastecimentoCadastroMediaVendasModule
          )
      },
      {
        path: 'nivel-material-estoque',
        loadChildren: () =>
          import('./nivel-estoque-deposito-new/nivel-estoque-deposito-new.module').then(
            m => m.AbastecimentoCadastrosNivelEstoqueDepositoNewModule
          )
      },
      {
        path: 'grupo-fornecedores',
        loadChildren: () =>
          import('./grupo-fornecedores/grupo-fornecedores.module').then(
            m => m.AbastecimentoCadastrosGrupoFornecedoresModule
          )
      },
      {
        path: 'integrador-depositos',
        loadChildren: () =>
          import('./integrador-depositos/integrador-depositos.module').then(
            m => m.AbastecimentoCadastrosIntegradorDepositosModule
          )
      },
      {
        path: 'parametros-gerais-estoque',
        loadChildren: () =>
          import('./parametros-gerais-estoque/parametros-gerais-estoque.module').then(
            m => m.AbastecimentoCadastrosParametrosGeraisEstoqueModule
          )
      },
      {
        path: 'classes-materiais',
        loadChildren: () =>
          import('./classes-materiais/classes-materiais.module').then(
            m => m.AbastecimentoCadastrosClassesMateriaisModule
          )
      },
      {
        path: 'manutencao-classes',
        loadChildren: () =>
          import('./manutencao-classes/manutencao-classes.module').then(
            m => m.AbastecimentoCadastrosManutencaoClassesModule
          )
      },
      {
        path: 'manutencao-materiais',
        loadChildren: () =>
          import('./manutencao-materiais/manutencao-materiais.module').then(
            m => m.AbastecimentoCadastrosManutencaoMateriaisModule
          )
      },
      {
        path: 'amarracao-materiais',
        loadChildren: () =>
          import('./amarracao-materiais/amarracao-materiais.module').then(
            m => m.AbastecimentoCadastrosAmarracaoMateriaisModule
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
export class AbastecimentoCadastroRoutingModule {}
