import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbastecimentoCadastrosManutencaoClassesComponent } from './manutencao-classes.component';

const routes: Routes = [
  {
    path:'',
    children: [
      {
        path: '',
        component: AbastecimentoCadastrosManutencaoClassesComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastrosManutencaoClassesRoutingModule { }
