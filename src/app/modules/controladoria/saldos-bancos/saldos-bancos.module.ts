import { SharedModule } from './../../../shared/modules/shared.module';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { 
  TooltipModule, 
  TimepickerModule,
  ptBrLocale,
  BsDatepickerModule,
  PaginationModule,
  TabsModule, 
  defineLocale } from 'ngx-bootstrap';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import ptBr from '@angular/common/locales/pt';

import { ControladoriaSaldosBancosRoutingModule } from './saldos-bancos-routing.module';
import { ControladoriaSaldosBancosComponent } from './saldos-bancos.component';
import { ControladoriaListaSaldosBancosComponent } from './listas/saldos-bancos/saldos-bancos.component';
import { ControladoriaCadastroSaldosBancosComponent } from './cadastros/saldos-bancos/saldos-bancos.component';
import { ControladoriaCadastroTiposSaldosBancosComponent } from './cadastros/tipos-saldos-bancos/tipos-saldos-bancos.component';
import { ControladoriaSaldosBancosLogComponent } from './modals/log/log.component';
import { ControladoriaListaTiposSaldosBancosComponent } from './listas/tipos-saldos-bancos/tipos-saldos-bancos.component';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    ControladoriaSaldosBancosComponent,
    ControladoriaListaSaldosBancosComponent,
    ControladoriaCadastroSaldosBancosComponent,
    ControladoriaListaTiposSaldosBancosComponent,
    ControladoriaCadastroTiposSaldosBancosComponent,
    ControladoriaSaldosBancosLogComponent
  ],
  imports: [
    CommonModule,
    ControladoriaSaldosBancosRoutingModule,
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
export class ControladoriaSaldosBancosModule { }
