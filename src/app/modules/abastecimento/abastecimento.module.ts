import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AbastecimentoRoutingModule } from './abastecimento-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import { AbastecimentoComponent } from './abastecimento.component';
import { AbastecimentoSimuladorComprasAramesComponent } from './simulador-compras-arames/simulador-compras-arames.component';
import { AbastecimentoSimuladorComprasAnalisesRealizadasComponent } from './simulador-compras-analises-realizadas/simulador-compras-analises-realizadas.component';

@NgModule({
  declarations: [
    AbastecimentoComponent,
    AbastecimentoSimuladorComprasAramesComponent,
    AbastecimentoSimuladorComprasAnalisesRealizadasComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoRoutingModule,
    ModuleWrapperModule,
    SharedModule,
    NotFoundModule
  ],
  providers: []
})
export class AbastecimentoModule {}
