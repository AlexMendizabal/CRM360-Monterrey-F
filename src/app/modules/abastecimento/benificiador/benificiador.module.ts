import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule, PaginationModule, BsDatepickerModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoBenificiadorComponent } from './benificiador.component';
import { AbastecimentoPainelRecebimentoComponent } from './painel-recebimento/painel-recebimento.component';
import { AbastecimentoBenificiadorRoutingModule } from './benificiador-routing.module';

@NgModule({
  declarations: [
    AbastecimentoBenificiadorComponent,
    AbastecimentoPainelRecebimentoComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoBenificiadorRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TemplatesModule
  ]
})
export class AbastecimentoBenificiadorModule { }
