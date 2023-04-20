import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

// ngx-bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialDisponibilidadeMaterialRoutingModule } from './disponibilidade-material-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialDisponibilidadeMaterialListaComponent } from './lista/lista.component';
import { ComercialDisponibilidadeMaterialFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialDisponibilidadeMaterialListaComponent,
    ComercialDisponibilidadeMaterialFormularioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    ComercialDisponibilidadeMaterialRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class ComercialDisponibilidadeMaterialModule {}
