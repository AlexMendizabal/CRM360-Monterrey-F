import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr);

import { NgSelectModule } from '@ng-select/ng-select';

import { TooltipModule, TabsModule, PaginationModule, BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';


import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import { AbastecimentoCadastrosManutencaoMateriaisRoutingModule } from './manutencao-materiais-routing.module';
import { AbastecimentoCadastrosManutencaoMateriaisComponent } from './manutencao-materiais.component';
import { AbastecimentoCadastrosManutencaoMateriaisModalLogsComponent } from './modal-logs/modal-logs.component';

@NgModule({
  declarations: [
    AbastecimentoCadastrosManutencaoMateriaisComponent,
    AbastecimentoCadastrosManutencaoMateriaisModalLogsComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosManutencaoMateriaisRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class AbastecimentoCadastrosManutencaoMateriaisModule { }
