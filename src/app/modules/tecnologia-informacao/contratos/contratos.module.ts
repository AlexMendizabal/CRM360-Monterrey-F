import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgBrazil } from 'ng-brazil';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextMaskModule } from 'angular2-text-mask';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { TecnologiaInformacaoCadastrosRoutingModule } from './contratos-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { TecnologiaInformacaoContratosComponent } from './contratos.component';
import { TecnologiaInformacaoTermoResponsabilidadeComponent } from './termo-responsabilidade/termo-responsabilidade.component';
import { TecnologiaInformacaoTermoDevolucaoComponent } from './termo-devolucao/termo-devolucao.component';

@NgModule({
  declarations: [
    TecnologiaInformacaoContratosComponent,
    TecnologiaInformacaoTermoResponsabilidadeComponent,
    TecnologiaInformacaoTermoDevolucaoComponent,
  ],
  imports: [
    CommonModule,
    TecnologiaInformacaoCadastrosRoutingModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    ReactiveFormsModule,
    CommonModule,
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
  ],
})
export class TecnologiaInformacaoContratosModule { }
