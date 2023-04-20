import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';

import ptBr from '@angular/common/locales/pt';
import { AccordionModule, defineLocale, ProgressbarModule, ptBrLocale, SortableModule } from 'ngx-bootstrap';
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

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

//masks
import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { LogisticaEntregaRetirasRoutingModule } from './retiras-routing.module';

import { LogisticaEntregaRetirasListaComponent } from './lista/lista.component';
import { LogisticaEntregaRetirasCadastroComponent } from './cadastro/cadastro.component';


@NgModule({
  declarations: [
    LogisticaEntregaRetirasListaComponent,
    LogisticaEntregaRetirasCadastroComponent
  ],
  imports: [
    CommonModule,
    LogisticaEntregaRetirasRoutingModule,
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
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
    CurrencyMaskModule,
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
    SortableModule.forRoot(),
  ]
})
export class LogisticaEntregaRetirasModule { }
