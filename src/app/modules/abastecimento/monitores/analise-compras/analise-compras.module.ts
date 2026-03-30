import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { OrderModule } from 'ngx-order-pipe';
import { TooltipModule, PaginationModule, BsDatepickerModule,ModalModule } from 'ngx-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoMonitoresAnaliseComprasRoutingModule } from './analise-compras-routing.module';
import { AbastecimentoMonitoresAnaliseComprasComponent } from './analise-compras.component';
import { AbastecimentoMonitoresAnaliseComprasModalEstoqueSuspensoComponent } from './modal-estoque-suspenso/modal-estoque-suspenso.component';
import { AbastecimentoMonitoresAnaliseCompraModalEstoqueComprometidoComponent } from './modal-estoque-comprometido/modal-estoque-comprometido.component';
import { AbastecimentoMonitoresAnaliseComprasModalVendasPerdidasComponent } from './modal-vendas-perdidas/modal-vendas-perdidas.component';
import { AbastecimentoMonitoresAnaliseComprasModalVendasRealizadasComponent } from './modal-vendas-realizadas/modal-vendas-realizadas.component';
import { AbastecimentoMonitoresAnaliseComprasModalCarteiraComponent } from './modal-carteira/modal-carteira.component';
import { AbastecimentoMonitoresAnaliseComprasModalNivelEstoqueComponent } from './modal-nivel-estoque/modal-nivel-estoque.component';

/* Localização Brasil */
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)
/* Localização Brasil */

@NgModule({
  declarations: [
    AbastecimentoMonitoresAnaliseComprasComponent,
    AbastecimentoMonitoresAnaliseComprasModalEstoqueSuspensoComponent,
    AbastecimentoMonitoresAnaliseCompraModalEstoqueComprometidoComponent,
    AbastecimentoMonitoresAnaliseComprasModalVendasPerdidasComponent,
    AbastecimentoMonitoresAnaliseComprasModalVendasRealizadasComponent,
    AbastecimentoMonitoresAnaliseComprasModalCarteiraComponent,
    AbastecimentoMonitoresAnaliseComprasModalNivelEstoqueComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoMonitoresAnaliseComprasRoutingModule,
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
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class AbastecimentoMonitoresAnaliseComprasModule { }
