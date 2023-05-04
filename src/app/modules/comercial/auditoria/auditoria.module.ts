import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialAuditoriaRoutingModule } from './auditoria-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { ComercialAuditoriaComponent } from './auditoria.component';
import { ComercialAuditoriaEnderecosEntregaComponent } from './enderecos-entrega/enderecos-entrega.component';

@NgModule({
  declarations: [
    ComercialAuditoriaComponent,
    ComercialAuditoriaEnderecosEntregaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    ComercialAuditoriaRoutingModule,
    SharedModule,
    TemplatesModule,
    CurrencyMaskModule,
  ],
  providers: [PNotifyService],
})
export class ComercialAuditoriaModule {}
