import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { OrderModule } from 'ngx-order-pipe';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoCadastrosNivelEstoqueDepositoNewRoutingModule } from './nivel-estoque-deposito-new-routing.module';
import { AbastecimentoCadastrosNivelEstoqueDepositoNewListaComponent } from './lista/lista.component';

/* Criação de mascaras em valores de formularios */
import { CurrencyMaskModule } from 'ng2-currency-mask'; 

/* Localização Brasil */
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { AbastecimentoCadastrosNivelEstoqueDepositoNewCadastroComponent } from './cadastro/cadastro.component';
registerLocaleData(ptBr)
/* Localização Brasil */

@NgModule({
  declarations: [
    AbastecimentoCadastrosNivelEstoqueDepositoNewListaComponent,
    AbastecimentoCadastrosNivelEstoqueDepositoNewCadastroComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosNivelEstoqueDepositoNewRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule,
    CurrencyMaskModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class AbastecimentoCadastrosNivelEstoqueDepositoNewModule { }
