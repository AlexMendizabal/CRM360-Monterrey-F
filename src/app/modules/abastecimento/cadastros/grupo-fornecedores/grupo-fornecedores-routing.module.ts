import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AbastecimentoCadastrosGrupoFornecedoresCadastroComponent } from './cadastro/cadastro.component';
import { AbastecimentoCadastrosGrupoFornecedoresListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosGrupoFornecedoresListaComponent
      },
      {
        path: 'cadastro',
        component: AbastecimentoCadastrosGrupoFornecedoresCadastroComponent
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AbastecimentoCadastrosGrupoFornecedoresRoutingModule { }
