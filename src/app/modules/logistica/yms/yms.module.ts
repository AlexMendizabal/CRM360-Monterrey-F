import { CountoModule } from 'angular2-counto';
import { CurrencyMaskModule } from 'ng2-currency-mask';
//angular
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Modules
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBrazil } from 'ng-brazil';
import {
  PaginationModule,
  TooltipModule,
  TabsModule,
  TimepickerModule,
  BsDatepickerModule,
  ModalModule,
  AccordionModule,
} from 'ngx-bootstrap';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgModule } from '@angular/core';
import { LogisticaYmsRoutingModule } from './yms-routing.module';
//Components
import { LogisticaYmsComponent } from './yms.component';

@NgModule({
  declarations: [
    LogisticaYmsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CountoModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PipesModule,
    NotFoundModule,
    CurrencyMaskModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
    LogisticaYmsRoutingModule,
  ],
})
export class LogisticaYmsModule {}
