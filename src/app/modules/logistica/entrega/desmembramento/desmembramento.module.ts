import { CountoModule } from 'angular2-counto';
import { LogisticaEntregaDesmembramentoRoutingModule } from './desmembramento-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { PaginationModule, TooltipModule, TabsModule, TimepickerModule, BsDatepickerModule, ModalModule, SortableModule, AccordionModule, ProgressbarModule } from 'ngx-bootstrap';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { LogisticaEntregaDesmembramentoComponent } from './desmembramento.component';
import { LogisticaEntregaDesmembramentoDetalhesComponent } from './detalhes/detalhes.component';

@NgModule({
  declarations: [
    LogisticaEntregaDesmembramentoComponent,
    LogisticaEntregaDesmembramentoDetalhesComponent,
  ],
  imports: [
    CommonModule,
    CountoModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    LogisticaEntregaDesmembramentoRoutingModule,
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
export class LogisticaEntregaDesmembramentoModule { }
