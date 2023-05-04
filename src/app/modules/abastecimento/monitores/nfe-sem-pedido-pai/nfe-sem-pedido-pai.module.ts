import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { NgSelectModule } from '@ng-select/ng-select';

import { TooltipModule, ModalModule, PaginationModule, BsDatepickerModule, TabsModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

import { AbastecimentoMonitoresNfeSemPedidoPaiRoutingModule } from './nfe-sem-pedido-pai-routing.module';
import { AbastecimentoMonitoresNfeSemPedidoPaiComponent } from './nfe-sem-pedido-pai.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';


@NgModule({
  declarations: [
    AbastecimentoMonitoresNfeSemPedidoPaiComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoMonitoresNfeSemPedidoPaiRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    OrderModule,
    CurrencyMaskModule,
    NgSelectModule,
    TemplatesModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class AbastecimentoMonitoresNfeSemPedidoPaiModule { }
