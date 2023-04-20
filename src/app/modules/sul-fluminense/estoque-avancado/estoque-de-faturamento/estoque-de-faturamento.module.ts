import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { BsDatepickerModule, defineLocale, PaginationModule, ptBrLocale, TooltipModule } from 'ngx-bootstrap';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import ptBr from '@angular/common/locales/pt';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { OrderModule } from 'ngx-order-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoRoutingModule } from './estoque-de-faturamento-routing.module';
import { SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoComponent } from './estoque-de-faturamento.component';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoRoutingModule,
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
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class SulFluminenseEstoqueAvancadoEstoqueDeFaturamentoModule { }
