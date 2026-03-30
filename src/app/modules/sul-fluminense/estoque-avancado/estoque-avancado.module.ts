import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  TooltipModule,
  PaginationModule,
  BsDatepickerModule
} from 'ngx-bootstrap';

//locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt)

import { OrderModule } from 'ngx-order-pipe';

import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { SulFluminenseEstoqueAvancadoComponent } from './estoque-avancado.component';
import { SulFluminenseEstoqueAvancadoRoutingModule } from './estoque-avancado-routing.module';

@NgModule({
  declarations: [
    SulFluminenseEstoqueAvancadoComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseEstoqueAvancadoRoutingModule,
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
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class SulFluminenseEstoqueAvancadoModule {}
