import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosManutencaoMateriaisComponent } from './manutencao-materiais.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoCadastrosManutencaoMateriaisComponent
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastrosManutencaoMateriaisRoutingModule { }
