import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialKanbanContratosListaComponent } from './lista/lista.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialKanbanContratosListaComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialKanbanContratosRoutingModule {}
