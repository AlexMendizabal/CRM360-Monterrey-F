import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicosContatosModule } from './contatos/contatos.module';
import { ServicosReservaSalasModule } from './reserva-salas/reserva-salas.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ServicosContatosModule, ServicosReservaSalasModule]
})
export class ServicosModule {}
