import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialKanbanVisaoRoListaComponent } from './lista/lista.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialKanbanVisaoRoListaComponent },
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
export class ComercialKanbanVisaoRoRoutingModule {}
