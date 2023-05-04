import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { NgSelectModule } from '@ng-select/ng-select';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { OrderModule } from 'ngx-order-pipe';

import { AbastecimentoCadastrosClassesMateriaisRoutingModule } from './classes-materiais-routing.module';
import { AbastecimentoCadastrosClassesMateriaisComponent } from './classes-materiais.component';


@NgModule({
  declarations: [
    AbastecimentoCadastrosClassesMateriaisComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosClassesMateriaisRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule
  ]
})
export class AbastecimentoCadastrosClassesMateriaisModule { }
