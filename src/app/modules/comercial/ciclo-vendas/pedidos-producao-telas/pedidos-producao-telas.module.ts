
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { ComercialCicloVendasPedidosProducaoTelasRoutingModule } from './pedidos-producao-telas-routing.module';
import { ComercialCicloVendasPedidosProducaoTelasListaModule } from './lista/lista.module';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModule } from './formulario/formulario.module';

// Interfaces
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ComercialCicloVendasPedidosProducaoTelasRoutingModule,
    ComercialCicloVendasPedidosProducaoTelasListaModule,
    ComercialCicloVendasPedidosProducaoTelasFormularioModule,

  ],
  providers: [FormDeactivateGuard],
})
export class ComercialCicloVendasPedidosProducaoTelasModule {}
