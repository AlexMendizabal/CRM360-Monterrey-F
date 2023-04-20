import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr);

import { ModalModule } from 'ngx-bootstrap/modal';
import { OrderModule } from 'ngx-order-pipe';
import { TooltipModule, PaginationModule, BsDatepickerModule, TabsModule } from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';


import { AbastecimentoCadastrosManutencaoClassesRoutingModule } from './manutencao-classes-routing.module';
import { AbastecimentoCadastrosManutencaoClassesComponent } from './manutencao-classes.component';
import { AbastecimentoCadastrosManutencaoClassesModalMateriaisStatusComponent } from './modal-materiais-status/modal-materiais-status.component';
import { AbastecimentoCadastrosManutencaoClassesModalLogsComponent } from './modal-logs/modal-logs.component';

@NgModule({
  declarations: [
    AbastecimentoCadastrosManutencaoClassesComponent,
    AbastecimentoCadastrosManutencaoClassesModalMateriaisStatusComponent,
    AbastecimentoCadastrosManutencaoClassesModalLogsComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosManutencaoClassesRoutingModule,
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
export class AbastecimentoCadastrosManutencaoClassesModule { }
