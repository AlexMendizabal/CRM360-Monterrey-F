import { TecnologiaInformacaoEstoquePipesModule } from './../pipes/pipes.module';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { RouterModule } from '@angular/router';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import ptBr from '@angular/common/locales/pt';
import { defineLocale, ptBrLocale, BsDatepickerModule } from 'ngx-bootstrap';
registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { TecnologiaInformacaoEstoquePainelAprovacaoListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoEstoquePainelAprovacaoRoutingModule } from './painel-aprovacao-routing.module';

@NgModule({
  declarations: [
    TecnologiaInformacaoEstoquePainelAprovacaoListaComponent,
  ],
  imports: [
    TecnologiaInformacaoEstoquePainelAprovacaoRoutingModule,
    TecnologiaInformacaoEstoquePipesModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PipesModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-br' }],
})
export class TecnologiaInformacaoEstoquePainelAprovacaoModule {}
