import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

import { NgSelectModule } from '@ng-select/ng-select';

import { AbastecimentoCadastrosVinculoMaterialDepositoNewRoutingModule } from './vinculo-material-deposito-new-routing.module';

/* Localização Brasil */
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)
/* Localização Brasil */

//Componentes do modulo
import { AbastecimentoCadastrosVinculoMaterialDepositoListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosVinculoMaterialDepositoListaNaoVinculadosComponent } from './lista-nao-vinculados/lista-nao-vinculados.component';
import { AbastecimentoCadastrosVinculoMaterialDepositoCadastroComponent } from './cadastro/cadastro.component';

@NgModule({
  declarations: [
    AbastecimentoCadastrosVinculoMaterialDepositoListaComponent,
    AbastecimentoCadastrosVinculoMaterialDepositoListaNaoVinculadosComponent,
    AbastecimentoCadastrosVinculoMaterialDepositoCadastroComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosVinculoMaterialDepositoNewRoutingModule,
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
    OrderModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class AbastecimentoCadastrosVinculoMaterialDepositoNewModule { }
