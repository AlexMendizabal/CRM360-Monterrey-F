import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { V2RoutingModule } from './v2-routing.module';
import { LogisticaDashboardsAnaliseFreteV2Component } from './v2.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule, ModalModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CountoModule } from 'angular2-counto';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';


@NgModule({
  declarations: [
    LogisticaDashboardsAnaliseFreteV2Component
  ],
  imports: [
    CommonModule,
    V2RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    CountoModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    PipesModule,
  ]
})
export class V2Module { }
