import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Counto
import { CountoModule } from 'angular2-counto';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { LogisticaDashboardsComponent } from './dashboards.component';

import { LogisticaDashboardsRoutingModule } from './dashboards-routing.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

@NgModule({
  declarations: [LogisticaDashboardsComponent],
  imports: [
    CommonModule,
    LogisticaDashboardsRoutingModule,
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
export class LogisticaDashboardsModule { }
