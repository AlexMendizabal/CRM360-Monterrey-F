import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosAmarracaoMateriaisComponent } from './amarracao-materiais.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoCadastrosAmarracaoMateriaisComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastrosAmarracaoMateriaisRoutingModule { }
