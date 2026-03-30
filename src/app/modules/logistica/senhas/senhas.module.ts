import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogisticaSenhasListaComponent } from './lista/lista.component';
import { LogisticaSenhasCadastroComponent } from './cadastro/cadastro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule, ModalModule, PaginationModule, TabsModule, TimepickerModule, TooltipModule } from 'ngx-bootstrap';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { LogisticaSenhasModuleRouting } from './senhas-routing.module';

@NgModule({
  declarations: [LogisticaSenhasListaComponent, LogisticaSenhasCadastroComponent],
  imports: [
    CommonModule,
    FormsModule,
    LogisticaSenhasModuleRouting,
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
  ]
})
export class SenhasModule { }
