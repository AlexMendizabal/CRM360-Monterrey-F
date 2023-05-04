import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { ServicosReservaSalasComponent } from './reserva-salas.component';

const routes: Routes = [
  {
    path: '',
    component: ServicosReservaSalasComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicosReservaSalasRoutingModule {}
