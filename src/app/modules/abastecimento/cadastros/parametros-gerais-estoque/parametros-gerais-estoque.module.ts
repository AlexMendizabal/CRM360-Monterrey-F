import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { OrderModule } from 'ngx-order-pipe';
import { TooltipModule, PaginationModule, TabsModule, ModalModule, BsDatepickerModule } from 'ngx-bootstrap';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { AbastecimentoCadastrosParametrosGeraisEstoqueRoutingModule } from './parametros-gerais-estoque-routing.module';
import { AbastecimentoCadastrosParametrosGeraisEstoqueListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosParametrosGeraisEstoqueVinculoDepositosComponent } from './vinculo-depositos/vinculo-depositos.component';
import { AbastecimentoCadastrosParametrosGeraisEstoqueDetalhesMateriaisComponent } from './detalhes-materiais/detalhes-materiais.component';

@NgModule({
  declarations: [
    AbastecimentoCadastrosParametrosGeraisEstoqueListaComponent, 
    AbastecimentoCadastrosParametrosGeraisEstoqueVinculoDepositosComponent, 
    AbastecimentoCadastrosParametrosGeraisEstoqueDetalhesMateriaisComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosParametrosGeraisEstoqueRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CurrencyMaskModule,
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule
  ]
})
export class AbastecimentoCadastrosParametrosGeraisEstoqueModule { }
