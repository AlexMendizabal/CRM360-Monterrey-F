import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { ComercialCicloVendasAutorizacionesRoutingModule } from './autorizaciones-routing.module';

import { AutorizacionesComponent } from './autorizaciones.component';

@NgModule({
  declarations: [
    AutorizacionesComponent
  ],
  imports: [
    CommonModule,
    ComercialCicloVendasAutorizacionesRoutingModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ]
})
export class ComercialCicloVendasAutorizacionesModule {}
