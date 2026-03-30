import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule, ModalModule, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CountoModule } from 'angular2-counto';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

import { LogisticaDashboardsAnaliseFretePieChartComponent } from './pie-chart/pie-chart.component';
import { LogisticaDashboardsAnaliseFreteLineChartComponent } from './line-chart/line-chart.component';
import { LogisticaDashboardsAnaliseFreteCardComponent } from './card/card.component';
import { LogisticaDashboardsAnaliseFreteBarhChartComponent } from './barh-chart/barh-chart.component';

@NgModule({
  declarations: [
    LogisticaDashboardsAnaliseFretePieChartComponent,
    LogisticaDashboardsAnaliseFreteLineChartComponent,
    LogisticaDashboardsAnaliseFreteCardComponent,
    LogisticaDashboardsAnaliseFreteBarhChartComponent
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
  ],
  exports:[
    LogisticaDashboardsAnaliseFretePieChartComponent,
    LogisticaDashboardsAnaliseFreteLineChartComponent,
    LogisticaDashboardsAnaliseFreteCardComponent,
    LogisticaDashboardsAnaliseFreteBarhChartComponent
  ]
})
export class LogisticaDashboardsAnaliseFreteComponentsModule {}
