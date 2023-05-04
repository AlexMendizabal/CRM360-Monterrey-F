
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosMateriaisTemplatesModule } from './../../../cadastros/materiais/templates/templates.module';
import { ComercialTemplatesModule } from './../../../templates/templates.module';
import { TemplatesModule } from './../../../../../shared/templates/templates.module';
import { SharedModule } from './../../../../../shared/modules/shared.module';

import { ModalModule } from 'ngx-bootstrap/modal';

import { ComercialComissoesRepresentantesProgramacaoPagamentosRoutingModule } from './programacao-pagamentos-routing.module';

// Components
import { ComercialComissoesRepresentantesProgramacaoPagamentosListaComponent } from './lista/lista.component';

// Services
import { ComercialComissoesRepresentantesProgramacaoPagamentosService } from './programacao-pagamentos.service';

// Pipe
import { CPFPipe } from './../../../../../shared/pipes/cpf.pipe';

@NgModule({
  declarations: [
    ComercialComissoesRepresentantesProgramacaoPagamentosListaComponent,
    CPFPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialComissoesRepresentantesProgramacaoPagamentosRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [
    PNotifyService,
    ComercialComissoesRepresentantesProgramacaoPagamentosService,
  ],
})
export class ComercialComissoesRepresentantesProgramacaoPagamentosModule {}
