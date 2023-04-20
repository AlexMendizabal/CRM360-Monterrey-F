//angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//components
import { LogisticaIntegracaoTMSNotasFiscaisComponent } from './tms/notas-fiscais/notas-fiscais.component';

//modules
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { LogisticaIntegracaoRoutingModule } from './integracao-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

//ng-select
import { NgSelectModule } from '@ng-select/ng-select';

//ngx
import { ModalModule, BsDatepickerModule, TimepickerModule, TabsModule, TooltipModule, PaginationModule } from 'ngx-bootstrap';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';


@NgModule({
  declarations: [LogisticaIntegracaoTMSNotasFiscaisComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PipesModule,
    LogisticaIntegracaoRoutingModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule
  ]
})
export class LogisticaIntegracaoModule { }
