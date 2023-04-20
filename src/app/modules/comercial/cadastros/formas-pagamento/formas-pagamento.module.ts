import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosFormasPagamentoModuleRoutingModule } from './formas-pagamento-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosFormasPagamentoListaComponent } from './lista/lista.component';
import { ComercialCadastrosFormasPagamentoFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialCadastrosFormasPagamentoListaComponent,
    ComercialCadastrosFormasPagamentoFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    CurrencyMaskModule,
    NgBrazil,
    ComercialCadastrosFormasPagamentoModuleRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService],
})
export class ComercialCadastrosFormasPagamentoModule {}
