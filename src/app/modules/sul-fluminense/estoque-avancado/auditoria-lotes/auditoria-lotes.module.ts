import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrderModule } from 'ngx-order-pipe';
import { TooltipModule, PaginationModule, BsDatepickerModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { SulFluminenseEstoqueAvancadoAuditoriaLotesRoutingModule } from './auditoria-lotes-routing.module';
import { SulFluminenseEstoqueAvancadoAuditoriaLotesComponent } from './auditoria-lotes.component';


@NgModule({
  declarations: [
    SulFluminenseEstoqueAvancadoAuditoriaLotesComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseEstoqueAvancadoAuditoriaLotesRoutingModule,
    NotFoundModule,
    OrderModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TemplatesModule
  ]
})
export class SulFluminenseEstoqueAvancadoAuditoriaLotesModule { }
