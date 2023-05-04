import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { CoreComponent } from './core.component';
import { CoreHomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: [
      {
        path: 'boas-vindas',
        component: CoreHomeComponent
      },
      {
        path: 'reserva-salas',
        loadChildren: () =>
          import('../servicos/reserva-salas/reserva-salas.module').then(
            m => m.ServicosReservaSalasModule
          )
      },
      {
        path: 'contatos',
        loadChildren: () =>
          import('../servicos/contatos/contatos.module').then(
            m => m.ServicosContatosModule
          )
      },
      {
        path: '',
        redirectTo: 'boas-vindas',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule {}
