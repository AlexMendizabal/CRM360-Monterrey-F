import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import {
  TooltipModule,
  PaginationModule,
  BsDatepickerModule
} from 'ngx-bootstrap';

import { SulFluminenseEntradaMateriaisRoutingModule } from './entrada-materiais-routing.module';
import { SulFluminenseEntradaMateriaisComponent } from './entrada-materiais.component';
import { SulFluminensePainelBobinasQualidadeComponent } from './painel-bobinas-qualidade/painel-bobinas-qualidade.component';
import { SulFluminenseConsultaRecebimentoBobinasComponent } from './consulta-recebimento-bobinas/consulta-recebimento-bobinas.component';

@NgModule({
  declarations: [
    SulFluminenseEntradaMateriaisComponent,
    SulFluminensePainelBobinasQualidadeComponent,
    SulFluminenseConsultaRecebimentoBobinasComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseEntradaMateriaisRoutingModule,
    NotFoundModule,
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
export class SulFluminenseEntradaMateriaisModule {}
