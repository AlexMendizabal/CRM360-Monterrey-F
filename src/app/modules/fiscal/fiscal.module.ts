import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { FiscalRoutingModule } from './fiscal-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

import { FiscalComponent } from './fiscal.component';
import { FiscalHomeComponent } from './home/home.component';
import { TimepickerModule, defineLocale, ptBrLocale } from 'ngx-bootstrap';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

@NgModule({
  declarations: [FiscalComponent, FiscalHomeComponent],
  imports: [
    CommonModule,
    FiscalRoutingModule,
    ModuleWrapperModule,
    NotFoundModule,
    TimepickerModule.forRoot(),
    ModalModule.forRoot(),
    TemplatesModule.forRoot()
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class FiscalModule {}
