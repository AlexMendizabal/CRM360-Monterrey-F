import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialKanbanPedidosListaComponent } from './lista/lista.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialKanbanPedidosListaComponent },
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
export class ComercialKanbanPedidosRoutingModule {}
