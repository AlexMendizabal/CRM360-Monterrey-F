import { ComercialTemplatesModule } from './../../templates/templates.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialGestaoTabelaPrecosRoutingModule } from './tabela-precos-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from './../../cadastros/materiais/templates/templates.module';
import { ModalModule } from 'ngx-bootstrap/modal';

// Components
import { ComercialGestaoTabelaPrecosListaComponent } from './lista/lista.component';
import { ComercialGestaoTabelaPrecosFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialGestaoTabelaPrecosService } from './tabela-precos.service';
import { ComercialTabelaPrecoCloneComponent } from './modais/clone/clone.component';
import { ComercialGestaoTabelaPrecoVisaoComercialComponent } from './visao-comercial/visao-comercial.component';
import { ComercialGestaoTabelaPrecosImportarCsvComponent } from './importar-csv/importar-csv.component';

@NgModule({
  declarations: [
    ComercialGestaoTabelaPrecosListaComponent,
    ComercialGestaoTabelaPrecosFormularioComponent,
    ComercialTabelaPrecoCloneComponent,
    ComercialGestaoTabelaPrecoVisaoComercialComponent,
    ComercialGestaoTabelaPrecosImportarCsvComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    TextMaskModule,
    ComercialGestaoTabelaPrecosRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [PNotifyService, ComercialGestaoTabelaPrecosService],
})
export class ComercialGestaoTabelaPrecosModule {}
