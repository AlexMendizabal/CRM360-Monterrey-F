import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// PNotify
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';

// Modules
import { TemplatesModule } from './../../../../shared/templates/templates.module';
import { SharedModule } from './../../../../shared/modules/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ComercialComissoesRepresentantesRoutingModule } from './representantes-routing.module';
import { ComercialComissoesRepresentantesProgramacaoPagamentosModule } from './programacao-pagamentos/programacao-pagamentos.module';

// Components
import { ComercialComissoesRepresentantesComponent } from './representantes.component';

@NgModule({
  declarations: [ComercialComissoesRepresentantesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    ComercialComissoesRepresentantesRoutingModule,
    ComercialComissoesRepresentantesProgramacaoPagamentosModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService],
})
export class ComercialComissoesRepresentantesModule {}
