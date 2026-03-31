import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule, ModalModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import {CountoModule} from 'angular2-counto';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

import { V1RoutingModule } from './v1-routing.module';
import { LogisticaDashboardsAnaliseFreteComponentsModule } from '../components/components.module';

import { LogisticaDashboardsAnaliseFreteV1Component } from './v1.component';


@NgModule({
  declarations: [
    LogisticaDashboardsAnaliseFreteV1Component
  ],
  imports: [
    CommonModule,
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
    V1RoutingModule,
    LogisticaDashboardsAnaliseFreteComponentsModule,
  ]
})
export class V1Module { }
