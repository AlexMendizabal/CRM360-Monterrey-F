import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogisticaDashboardsConferenciaCteComponent } from './conferencia-cte.component';
import { LogisticaDashboadsConferenciaCteRoutingModule } from './conferencia-cte-routing.modulte';

import { NotFoundModule } from './../../../../core/not-found/not-found.module';

import { BsDatepickerModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';
import { CountoModule } from 'angular2-counto';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';


@NgModule({
  declarations: [
    LogisticaDashboardsConferenciaCteComponent
  ],
  imports: [
    CommonModule,
    LogisticaDashboadsConferenciaCteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    CountoModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule
  ]
})
export class LogisticaDashboardsConferenciaCteModule { }
