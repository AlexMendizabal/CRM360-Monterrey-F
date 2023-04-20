import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';

// Modules
import { ComercialRelatoriosFaturamentoDetalhadoDuqueRoutingModule } from './faturamento-detalhado-duque-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialRelatoriosFaturamentoDetalhadoDuqueComponent } from './faturamento-detalhado-duque.component';

@NgModule({
  declarations: [ComercialRelatoriosFaturamentoDetalhadoDuqueComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    ComercialRelatoriosFaturamentoDetalhadoDuqueRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class ComercialRelatoriosFaturamentoDetalhadoDuqueModule {}
