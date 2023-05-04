import { SharedModule } from 'src/app/shared/modules/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoCadastroRoutingModule } from './cadastros-routing.module';
import { AbastecimentoCadastrosComponent } from './cadastros.component';
import { TooltipModule } from 'ngx-bootstrap';


@NgModule({
  declarations: [
    AbastecimentoCadastrosComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastroRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TemplatesModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class AbastecimentoCadastrosModule {}