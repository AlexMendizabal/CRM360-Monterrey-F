import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';

import ptBr from '@angular/common/locales/pt';
import { defineLocale, ptBrLocale } from 'ngx-bootstrap';
registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NotFoundModule } from './../../core/not-found/not-found.module';
import { LogisticaRoutingModule } from './logistica-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';

import { LogisticaHomeComponent } from './home/home.component';
import { LogisticaBaixaTitulosComponent } from './baixa-de-titulos/baixa-titulos.component';
import { LogisticaComponent } from './logistica.component';
import { LogisticaCertificadoQualidadeComponent } from './certificado-qualidade/certificado-qualidade.component';
import { LogisticaGestaoAssociacaoUsuarioEmpresaComponent } from './gestao/associacao-usuario-empresa/associacao-usuario-empresa.component';
import { LogisticaEstoqueEstoqueDivergenteComponent } from './estoque/estoque-divergente/estoque-divergente.component';
import { LogisticaEstoqueEstoqueDivergenteListaComponent } from './estoque/estoque-divergente/lista/lista.component';
import { LogisticaRenderizadorComponent } from './renderizador/renderizador.component';
import { LogisticaRenderizadorIframeComponent } from './renderizador/iframe/iframe.component';

//masks
import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  declarations: [
    LogisticaComponent,
    LogisticaHomeComponent,
    LogisticaBaixaTitulosComponent,
    LogisticaCertificadoQualidadeComponent,
    LogisticaRenderizadorIframeComponent,
    LogisticaEstoqueEstoqueDivergenteComponent,
    LogisticaEstoqueEstoqueDivergenteListaComponent,
    LogisticaGestaoAssociacaoUsuarioEmpresaComponent,
    LogisticaRenderizadorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PipesModule,
    LogisticaRoutingModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-br' }],
})
export class LogisticaModule { }
