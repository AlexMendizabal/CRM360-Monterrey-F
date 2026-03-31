import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

/* Localização Brasil */
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)
/* Localização Brasil */

import { AbastecimentoCadastrosIntegradorDepositosRoutingModule } from './integrador-depositos-routing.module';
import { AbastecimentoCadastrosIntegradorDepositosListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosIntegradorDepositosCadastroComponent } from './cadastro/cadastro.component';

@NgModule({
  declarations: [
    AbastecimentoCadastrosIntegradorDepositosListaComponent, 
    AbastecimentoCadastrosIntegradorDepositosCadastroComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosIntegradorDepositosRoutingModule,
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
export class AbastecimentoCadastrosIntegradorDepositosModule { }
