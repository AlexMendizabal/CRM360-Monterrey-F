import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { defineLocale, ptBrLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import ptBr from '@angular/common/locales/pt';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { OrderModule } from 'ngx-order-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { SulFluminenseEstoqueAvancadoEstoquePorLoteRoutingModule } from './estoque-por-lote-routing.module';
import { SulFluminenseEstoqueAvancadoEstoquePorLoteComponent } from './estoque-por-lote.component';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [
    SulFluminenseEstoqueAvancadoEstoquePorLoteComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseEstoqueAvancadoEstoquePorLoteRoutingModule,
    NotFoundModule,
    OrderModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CurrencyMaskModule,
    NgSelectModule,
    TemplatesModule
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class SulFluminenseEstoqueAvancadoEstoquePorLoteModule { }
