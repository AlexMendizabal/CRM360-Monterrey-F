import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//locale pt-BR
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { CollapseModule } from 'ngx-bootstrap';

// Counto
import { CountoModule } from 'angular2-counto';

import { SharedModule } from 'src/app/shared/modules/shared.module';

import { SulFluminenseCardsMateriaisComponent } from './cards-materiais/cards-materiais.component';
import { SulFluminensePainelDecisaoAbastecimentoComponent } from './painel-decisao-abastecimento.component';
import { SulFluminensePainelDecisaoFilterPipe } from './filter.pipe';

@NgModule({
  declarations: [
    SulFluminenseCardsMateriaisComponent,
    SulFluminensePainelDecisaoAbastecimentoComponent,
    SulFluminensePainelDecisaoFilterPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    TemplatesModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SortableModule.forRoot(),
    NgSelectModule,
    CountoModule,
    CollapseModule.forRoot(),
    SharedModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class SulFluminensePainelDecisaoAbastecimentoModule {}
