import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { TooltipModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgModule, LOCALE_ID } from '@angular/core';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { OrderModule } from 'ngx-order-pipe';

//locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt)

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoMonitoresRoutingModule } from './monitores-routing.module';
import { AbastecimentoMonitoresComponent } from './monitores.component';
import { AbastecimentoPainelEstoqueComponent } from './painel-estoque/painel-estoque.component';

@NgModule({
  declarations: [
    AbastecimentoMonitoresComponent,
    AbastecimentoPainelEstoqueComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoMonitoresRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    OrderModule,
    NgSelectModule,
    TemplatesModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class AbastecimentoMonitoresModule { }
