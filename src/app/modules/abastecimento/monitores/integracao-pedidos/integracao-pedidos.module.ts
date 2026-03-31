import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule, ModalModule, PaginationModule, BsDatepickerModule, TabsModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoMonitoresIntegracaoPedidosRoutingModule } from './integracao-pedidos-routing.module';
import { AbastecimentoMonitoresIntegracaoPedidosComponent } from './integracao-pedidos.component';


@NgModule({
  declarations: [AbastecimentoMonitoresIntegracaoPedidosComponent],
  imports: [
    CommonModule,
    AbastecimentoMonitoresIntegracaoPedidosRoutingModule,
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
    NgSelectModule,
    TemplatesModule
  ]
})
export class AbastecimentoMonitoresIntegracaoPedidosModule { }
