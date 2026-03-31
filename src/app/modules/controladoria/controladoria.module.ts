import { PipesModule } from './../../shared/pipes/pipes.module';
import { SharedModule } from './../../shared/modules/shared.module';
import { ModuleWrapperModule } from './../../core/module-wrapper/module-wrapper.module';
import { TemplatesModule } from './../../shared/templates/templates.module';
import { ControladoriaComponent } from './controladoria.component';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import {
  TimepickerModule,
  defineLocale,
  ptBrLocale,
  TooltipModule,
} from 'ngx-bootstrap';
import { NotFoundModule } from './../../core/not-found/not-found.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  BsDatepickerModule,
  PaginationModule,
  TabsModule,
} from 'ngx-bootstrap';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import ptBr from '@angular/common/locales/pt';
import { ControladoriaHomeComponent } from './home/home.component';
import { ControladoriaRoutingModule } from './controladoria-routing.module';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    ControladoriaComponent,
    ControladoriaHomeComponent,
  ],
  imports: [
    CommonModule,
    ControladoriaRoutingModule,
    ModuleWrapperModule,
    TemplatesModule.forRoot(),
    FormsModule,
    NgSelectModule,
    SharedModule,
    TooltipModule,
    NotFoundModule,
    PipesModule,
    CurrencyMaskModule,
    ReactiveFormsModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class ControladoriaModule { }
