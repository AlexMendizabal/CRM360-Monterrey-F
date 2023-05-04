import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicosReservaSalasRoutingModule } from './reserva-salas-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { ServicosReservaSalasComponent } from './reserva-salas.component';

@NgModule({
  declarations: [ServicosReservaSalasComponent],
  imports: [
    CommonModule,
    ServicosReservaSalasRoutingModule,
    NotFoundModule,
    SharedModule
  ]
})
export class ServicosReservaSalasModule {}
