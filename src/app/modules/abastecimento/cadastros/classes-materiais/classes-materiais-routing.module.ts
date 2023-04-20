import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosClassesMateriaisComponent } from './classes-materiais.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AbastecimentoCadastrosClassesMateriaisComponent
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastrosClassesMateriaisRoutingModule { }
