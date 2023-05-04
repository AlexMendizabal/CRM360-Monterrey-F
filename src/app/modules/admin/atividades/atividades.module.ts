import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminAtividadesRoutingModule } from './atividades-routing.module';

import { AdminAtividadesListaComponent } from './lista/lista.component';
import { AdminAtividadesCadastroComponent } from './cadastro/cadastro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule, ModalModule, PaginationModule, TabsModule, TimepickerModule, TooltipModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';


@NgModule({
  declarations: [
    AdminAtividadesListaComponent,
    AdminAtividadesCadastroComponent
  ],
  imports: [
    CommonModule,
    AdminAtividadesRoutingModule,
    FormsModule,
    ModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    ModuleWrapperModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    PipesModule,
  ]
})
export class AdminAtividadesModule { }
