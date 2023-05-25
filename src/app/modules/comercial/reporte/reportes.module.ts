import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Counto
import { CountoModule } from 'angular2-counto';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialClientesRoutingModule } from './reportes-routing.module';

// Components
import { ComercialClientesListaComponent } from './lista/lista.component';


@NgModule({
  declarations: [
    ComercialClientesListaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CountoModule,
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    CurrencyMaskModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialClientesRoutingModule,
  /*   ComercialClientesDashboardModule,
    ComercialClientesHistoricoFinanceiroModule */
  ]
})
export class ComercialReportesModule {}
