import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgSelectModule } from '@ng-select/ng-select';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SortableModule, ProgressbarModule } from 'ngx-bootstrap';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import { LogisticaPedagioRoutingModule } from './pedagio-routing.module';

import { LogisticaPedagioListaComponent } from './lista/lista.component';
import { LogisticaPedagioCadastroComponent } from './cadastro/cadastro.component';



@NgModule({
  declarations: [
    LogisticaPedagioListaComponent,
    LogisticaPedagioCadastroComponent
  ],
  imports: [
    CommonModule,
    LogisticaPedagioRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    SortableModule.forRoot(),
    ModalModule.forRoot(),
    NotFoundModule,
    PipesModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgBrazil,
    TextMaskModule,
    CurrencyMaskModule
  ]
})
export class PedadioModule { }
