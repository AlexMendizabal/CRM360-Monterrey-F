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
import { ComercialComissoesVendedoresInternosGestaoComissionamentosRoutingModule } from './gestao-comissionamentos.routing.module';

// Components
import { ComercialComissoesVendedoresInternosGestaoComissionamentosListaComponent } from './lista/lista.component';
import { ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialComissoesVendedoresInternosGestaoComissionamentosService } from './gestao-comissionamentos.service';

@NgModule({
  declarations: [
    ComercialComissoesVendedoresInternosGestaoComissionamentosListaComponent,
    ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialComissoesVendedoresInternosGestaoComissionamentosRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [
    PNotifyService,
    ComercialComissoesVendedoresInternosGestaoComissionamentosService,
  ],
})
export class ComercialComissoesVendedoresInternosGestaoComissionamentosModule {}
