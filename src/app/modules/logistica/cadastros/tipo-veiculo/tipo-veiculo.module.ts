import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { NgSelectModule } from '@ng-select/ng-select';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';

import { LogisticaTipoVeiculoRoutingModule } from './tipo-veiculo-routing.module';

import { LogisticaTipoVeiculoListaComponent } from './lista/lista.component';
import { LogisticaTipoVeiculoCadastroComponent } from './cadastro/cadastro.component';



@NgModule({
  declarations: [
    LogisticaTipoVeiculoListaComponent,
    LogisticaTipoVeiculoCadastroComponent
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
    NgBrazil,
    TextMaskModule,
    LogisticaTipoVeiculoRoutingModule
  ]
})
export class LogisticaTipoVeiculoModule { }
