import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
import { SortableModule } from 'ngx-bootstrap/sortable';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoCadastrosAmarracaoMateriaisRoutingModule } from './amarracao-materiais-routing.module';
import { AbastecimentoCadastrosAmarracaoMateriaisComponent } from './amarracao-materiais.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';


@NgModule({
  declarations: [
    AbastecimentoCadastrosAmarracaoMateriaisComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosAmarracaoMateriaisRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    SortableModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule,
    CurrencyMaskModule
  ]
})
export class AbastecimentoCadastrosAmarracaoMateriaisModule { }
