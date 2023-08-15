import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { ComercialCicloVendasAutorizacionesComponent } from './autorizaciones.component';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialClientesDashboardModule } from '../../clientes/dashboard/dashboard.module';



@NgModule({
  declarations: [
    ComercialCicloVendasAutorizacionesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgSelectModule,
    SharedModule,
    TemplatesModule,
    ComercialClientesDashboardModule
  ],
  exports: [
  ],
})
export class ComercialCicloVendasAutorizacionesModule {}
