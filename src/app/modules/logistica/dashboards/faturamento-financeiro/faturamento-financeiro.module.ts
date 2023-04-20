import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogisticaDashboardsFaturamentoFinanceiroComponent } from './faturamento-financeiro.component';
import { LogisticaDashboadsFaturamentoFinanceiroRoutingModule } from './faturamento-financeiro-routing.module';

import { NotFoundModule } from './../../../../core/not-found/not-found.module';

import { BsDatepickerModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';
import { CountoModule } from 'angular2-counto';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { LogisticaDashboardsFaturamentoFinanceiroNovosComponent } from './novos/novos.component';
import { LogisticaDashboardsFaturamentoFinanceiroClientesComponent } from './clientes/clientes.component';
import { LogisticaDashboardsFaturamentoFinanceiroTodosComponent } from './todos/todos.component';


@NgModule({
  declarations: [
    LogisticaDashboardsFaturamentoFinanceiroComponent,
    LogisticaDashboardsFaturamentoFinanceiroNovosComponent,
    LogisticaDashboardsFaturamentoFinanceiroClientesComponent,
    LogisticaDashboardsFaturamentoFinanceiroTodosComponent
  ],
  imports: [
    CommonModule,
    LogisticaDashboadsFaturamentoFinanceiroRoutingModule,
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
export class LogisticaDashboardsFaturamentoFinanceiroModule { }
