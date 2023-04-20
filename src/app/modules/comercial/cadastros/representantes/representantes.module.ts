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

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// PNotify
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';

// Modules
import { TemplatesModule } from './../../../../shared/templates/templates.module';
import { SharedModule } from './../../../../shared/modules/shared.module';
import { ComercialCadastrosMateriaisTemplatesModule } from './../../cadastros/materiais/templates/templates.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ComercialCadastrosRepresentantesRoutingModule } from './representantes-routing.module';

// Components
import { ComercialCadastrosRepresentantesListaComponent } from './lista/lista.component';
import { ComercialCadastrosRepresentantesFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosRepresentantesService } from './representantes.service';

@NgModule({
  declarations: [
    ComercialCadastrosRepresentantesListaComponent,
    ComercialCadastrosRepresentantesFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosRepresentantesRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TextMaskModule,
    NgBrazil,
  ],
  providers: [PNotifyService, ComercialCadastrosRepresentantesService],
})
export class ComercialCadastrosRepresentantesModule {}
