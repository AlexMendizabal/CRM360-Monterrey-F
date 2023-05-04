import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogisticaEngregasMonitoresFusionManetoniPedidosComponent } from './fusion/manetoni/pedidos.component';

const routes: Routes = [
  {
    path: 'fusion/pedidos',
    component: LogisticaEngregasMonitoresFusionManetoniPedidosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaEntregaMonitoresRoutingModule { }
