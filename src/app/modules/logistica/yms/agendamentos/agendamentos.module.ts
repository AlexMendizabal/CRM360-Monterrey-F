import { LogisticaVeiculosModule } from './../../cadastros/veiculos/veiculos.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { LogisticaVeiculosModaisTransportadorasComponent } from './../../cadastros/veiculos/modais/transportadoras/transportadoras.component';
import { LogisticaVeiculosModaisMotoristasComponent } from './../../cadastros/veiculos/modais/motoristas/motoristas.component';
import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  PaginationModule,
  TooltipModule,
  TabsModule,
  TimepickerModule,
  BsDatepickerModule,
  ModalModule,
} from 'ngx-bootstrap';

import { NgSelectModule } from '@ng-select/ng-select';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';


import { LogisticaYmsAgendamentosListaComponent } from './lista/lista.component';
import { LogisticaYmsAgendamentosCadastroComponent } from './cadastro/cadastro.component';

import { LogisticaYmsAgendamentosRoutingModule } from './agendamentos-routing.module';
import { LogisticaYmsAgendamentosModaisVeiculosComponent } from './modais/veiculos/veiculos.component';
import { LogisticaYmsAgendamentosModaisMateriaisComponent } from './modais/materiais/materiais.component';
import { LogisticaYmsAgendamentosModaisNotasFiscaisComponent } from './modais/notas-fiscais/notas-fiscais.component';
import { LogisticaYmsAgendamentosDragAndDropComponent } from './drag-and-drop/drag-and-drop.component';

@NgModule({
  declarations: [
    LogisticaYmsAgendamentosListaComponent,
    LogisticaYmsAgendamentosCadastroComponent,
    LogisticaYmsAgendamentosModaisVeiculosComponent,
    LogisticaYmsAgendamentosModaisMateriaisComponent,
    LogisticaYmsAgendamentosModaisNotasFiscaisComponent,
    LogisticaYmsAgendamentosDragAndDropComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PipesModule,
    NotFoundModule,
    ModuleWrapperModule,
    CurrencyMaskModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    LogisticaYmsAgendamentosRoutingModule,
    LogisticaVeiculosModule
  ]
})
export class LogisticaYmsAgendamentosModule { }
