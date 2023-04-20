import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule, PaginationModule, BsDatepickerModule, ModalModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoCadastroMediaVendasRoutingModule } from './media-vendas-routing.module';
import { AbastecimentoCadastrosMediaVendasListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosMediaVendasEditaComponent } from './edita/edita.component';
import { AbastecimentoCadastrosMediaVendasCadastroComponent } from './cadastro/cadastro.component';
import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  declarations: [
    AbastecimentoCadastrosMediaVendasListaComponent,
    AbastecimentoCadastrosMediaVendasEditaComponent,
    AbastecimentoCadastrosMediaVendasCadastroComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastroMediaVendasRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class AbastecimentoCadastroMediaVendasModule { }
