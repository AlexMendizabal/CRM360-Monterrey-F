import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Modules
import { ComercialCicloVendasPedidosProducaoTelasListaModule } from './lista/lista.module';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModule } from './formulario/formulario.module';

// Components
import { ComercialCicloVendasPedidosProducaoTelasListaComponent } from './lista/lista.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioComponent } from './formulario/formulario.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioResolverGuard } from './guards/formulario-resolver.guard';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialCicloVendasPedidosProducaoTelasListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCicloVendasPedidosProducaoTelasFormularioComponent,
    resolve: {
      data: ComercialCicloVendasPedidosProducaoTelasFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: 'editar/:nrProposta',
    component: ComercialCicloVendasPedidosProducaoTelasFormularioComponent,
    resolve: {
      data: ComercialCicloVendasPedidosProducaoTelasFormularioResolverGuard,
    },
    canDeactivate: [FormDeactivateGuard],
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ComercialCicloVendasPedidosProducaoTelasListaModule,
    ComercialCicloVendasPedidosProducaoTelasFormularioModule,
  ],
  exports: [RouterModule],
})
export class ComercialCicloVendasPedidosProducaoTelasRoutingModule {}
