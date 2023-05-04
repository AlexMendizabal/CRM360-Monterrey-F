import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import ptBr from '@angular/common/locales/pt';
// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosMateriaisContratoRoutingModule } from './contratos-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialCadastrosMateriaisContratoListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisContratoFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosMateriaisContratoService } from './contratos.service';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisContratoListaComponent,
    ComercialCadastrosMateriaisContratoFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosMateriaisContratoRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
  ],
  providers: [PNotifyService, ComercialCadastrosMateriaisContratoService],
})
export class ComercialCadastrosMateriaisContratoModule {}
