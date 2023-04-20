import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgBrazil } from 'ng-brazil';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import ptBr from '@angular/common/locales/pt';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { ComercialAknaLogBoasVindasRoutingModule } from './log-boas-vindas-routing.module';
import { ComercialAknaLogBoasVindasComponent } from './log-boas-vindas.component';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

@NgModule({
  declarations: [ComercialAknaLogBoasVindasComponent],
  imports: [
    CommonModule,
    ComercialAknaLogBoasVindasRoutingModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    CurrencyMaskModule,
    SharedModule,
    PipesModule,
    TemplatesModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
})
export class ComercialAknaLogBoasVindasModule {}
