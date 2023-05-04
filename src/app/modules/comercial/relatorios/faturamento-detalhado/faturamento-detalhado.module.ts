import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

// ngx-bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { ComercialRelatoriosFaturamentoDetalhadoRoutingModule } from './faturamento-detalhado-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialRelatoriosFaturamentoDetalhadoComponent } from './faturamento-detalhado.component';

@NgModule({
  declarations: [ComercialRelatoriosFaturamentoDetalhadoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    NgSelectModule,
    ComercialRelatoriosFaturamentoDetalhadoRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class ComercialRelatoriosFaturamentoDetalhadoModule {}
