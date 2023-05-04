import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { SulFluminenseRoutingModule } from './sul-fluminense-routing.module';

import { SulFluminenseComponent } from './sul-fluminense.component';
import { SulFluminenseMateriaisQualidadeComponent } from './materiais-qualidade/materiais-qualidade.component';
import { SulFluminenseMateriaisRecebimentoComponent } from './materiais-recebimento/materiais-recebimento.component';

@NgModule({
  declarations: [
    SulFluminenseComponent,
    SulFluminenseMateriaisQualidadeComponent,
    SulFluminenseMateriaisRecebimentoComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseRoutingModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule
  ],
  providers: []
})
export class SulFluminenseModule {}
