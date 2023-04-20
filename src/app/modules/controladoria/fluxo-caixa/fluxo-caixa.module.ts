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

import { ControladoriaFluxoCaixaRoutingModule } from './fluxo-caixa-routing.module';
import { ControladoriaFluxoCaixaComponent } from './fluxo-caixa.component';
import { ControladoriaListaFluxoCaixaComponent } from './listas/fluxo-caixa/fluxo-caixa.component';
import { ControladoriaCadastrosFluxoCaixaComponent } from './cadastros/fluxo-caixa/fluxo-caixa.component';
import { ControladoriaFluxoCaixaLogsComponent } from './modals/logs/logs.component';
import { ControladoriaTiposFluxoCaixaComponent } from './listas/tipos-fluxo-caixa/tipos-fluxo-caixa.component';
import { ControladoriaCadastroTiposFluxoCaixaComponent } from './cadastros/tipos-fluxo-caixa/tipos-fluxo-caixa.component';
import { ControladoriaListaEmpresasComponent } from './listas/empresas/empresas.component';
import { ControladoriaCadastroEmpresasComponent } from './cadastros/empresas/empresas.component';
import { ControladoriaListaBancosComponent } from './listas/bancos/bancos.component';
import { ControladoriaCadastroBancosComponent } from './cadastros/bancos/bancos.component';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    ControladoriaFluxoCaixaComponent,
    ControladoriaListaFluxoCaixaComponent,
    ControladoriaCadastrosFluxoCaixaComponent,
    ControladoriaTiposFluxoCaixaComponent,
    ControladoriaCadastroTiposFluxoCaixaComponent,
    ControladoriaListaEmpresasComponent, 
    ControladoriaCadastroEmpresasComponent,
    ControladoriaListaBancosComponent, 
    ControladoriaCadastroBancosComponent,
    ControladoriaFluxoCaixaLogsComponent
  ],
  imports: [
    CommonModule,
    ControladoriaFluxoCaixaRoutingModule,
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
export class ControladoriaFluxoCaixaModule { }
