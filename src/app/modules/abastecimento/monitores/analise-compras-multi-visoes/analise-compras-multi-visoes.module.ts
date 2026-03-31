import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { TooltipModule, PaginationModule, BsDatepickerModule,ModalModule, TabsModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

import { NgSelectModule } from '@ng-select/ng-select';

import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr);

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoMonitoresAnaliseComprasMultiVisoesRoutingModule } from './analise-compras-multi-visoes-routing.module';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesComponent } from './analise-compras-multi-visoes.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoMaterialComponent } from './visao-material/visao-material.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoClasseComponent } from './visao-classe/visao-classe.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoSublinhaComponent } from './visao-sublinha/visao-sublinha.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoLinhaComponent } from './visao-linha/visao-linha.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoDepositoComponent } from './visao-deposito/visao-deposito.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoEmpresaComponent } from './visao-empresa/visao-empresa.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoTipoMaterialComponent } from './visao-tipo-material/visao-tipo-material.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesModalVisaoMensalComponent } from './modal-visao-mensal/modal-visao-mensal.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesModalAlterarAgrupamentoComponent } from './modal-alterar-agrupamento/modal-alterar-agrupamento.component';
import { AbastecimentoMonitoresAnaliseComprasMultiVisoesModalFavoritosComponent } from './modal-favoritos/modal-favoritos.component';

@NgModule({
  declarations: [
    AbastecimentoMonitoresAnaliseComprasMultiVisoesComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoMaterialComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoClasseComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoSublinhaComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoLinhaComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoDepositoComponent,
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoEmpresaComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoTipoMaterialComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesModalVisaoMensalComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesModalAlterarAgrupamentoComponent, 
    AbastecimentoMonitoresAnaliseComprasMultiVisoesModalFavoritosComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoMonitoresAnaliseComprasMultiVisoesRoutingModule,
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
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesModule { }
