import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCicloVendasRoutingModule } from './ciclo-vendas-routing.module';

// Components
import { ComercialCicloVendasComponent } from './ciclo-vendas.component';
import { AutorizacionesComponent } from './autorizaciones/autorizaciones.component';

@NgModule({
  declarations: [ComercialCicloVendasComponent, AutorizacionesComponent],
  imports: [
    CommonModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    ComercialCicloVendasRoutingModule
  ]
})
export class ComercialCicloVendasModule {}
