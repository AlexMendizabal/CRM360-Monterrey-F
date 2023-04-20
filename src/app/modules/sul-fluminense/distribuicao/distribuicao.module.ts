import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { SharedModule } from './../../../shared/modules/shared.module';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { SulFluminensePainelDecisaoAbastecimentoModule } from './painel-decisao-abastecimento/painel-decisao-abastecimento.module';
import { SulFluminenseDistribuicaoRoutingModule } from './distribuicao-routing.module';
import { SulFluminenseDistribuicaoComponent } from './distribuicao.component';

@NgModule({
  declarations: [
    SulFluminenseDistribuicaoComponent
  ],
  imports: [
    CommonModule,
    SulFluminensePainelDecisaoAbastecimentoModule,
    SulFluminenseDistribuicaoRoutingModule,
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
export class SulFluminenseDistribuicaoModule { }
