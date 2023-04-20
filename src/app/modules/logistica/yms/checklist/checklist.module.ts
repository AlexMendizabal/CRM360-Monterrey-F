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


import { LogisticaYmsChecklistListaComponent } from './lista/lista.component';
import { LogisticaYmsChecklistCadastroComponent } from './cadastro/cadastro.component';

import { LogisticaYmsChecklistRoutingModule } from './checklist-routing.module';

@NgModule({
  declarations: [
    LogisticaYmsChecklistListaComponent,
    LogisticaYmsChecklistCadastroComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
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
    SharedModule,
    TemplatesModule,
    LogisticaYmsChecklistRoutingModule
  ]
})
export class LogisticaYmsChecklistModule { }
