import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogisticaDashboardsGestaoCarteiraComponent } from './gestao-carteira.component';
import { LogisticaDashboadsGestaoCarteiraRoutingModule } from './gestao-carteira-routing.module';

import { NotFoundModule } from './../../../../core/not-found/not-found.module';

import { BsDatepickerModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';
import { CountoModule } from 'angular2-counto';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';


@NgModule({
  declarations: [
    LogisticaDashboardsGestaoCarteiraComponent
  ],
  imports: [
    CommonModule,
    LogisticaDashboadsGestaoCarteiraRoutingModule,
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
export class LogisticaDashboardsGestaoCarteiraModule { }
