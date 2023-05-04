import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialKanbanComercialComponent } from './kanban-comercial.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialKanbanComercialComponent,
      },
      {
        path: 'pedidos',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './pedidos/pedidos.module'
              ).then(
                (m) =>
                  m.ComercialKanbanPedidosModule
              ),
          },
        ],
      },
      {
        path: 'contratos',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './contratos/contratos.module'
              ).then(
                (m) =>
                  m.ComercialKanbanContratosModule
              ),
          },
        ],
      },
      {
        path: 'visao-ro',
        children: [
          {
            path: '',
            loadChildren: () =>
              import(
                './visao-ro/visao-ro.module'
              ).then(
                (m) =>
                  m.ComercialKanbanVisaoRoModule
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialKanbanComercialRoutingModule {}
