import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { PowerBiRoutingModule } from './power-bi-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

// Components
import { PowerBiComponent } from './power-bi.component';
import { PowerBiHomeComponent } from './home/home.component';
import { PowerBiRenderizadorComponent } from './renderizador/renderizador.component';
import { PowerBiRenderizadorSubmoduloComponent } from './renderizador/submodulo/submodulo.component';
import { PowerBiRenderizadorAtividadeComponent } from './renderizador/atividade/atividade.component';

@NgModule({
  declarations: [
    PowerBiComponent,
    PowerBiHomeComponent,
    PowerBiRenderizadorComponent,
    PowerBiRenderizadorSubmoduloComponent,
    PowerBiRenderizadorAtividadeComponent
  ],
  imports: [
    CommonModule,
    PowerBiRoutingModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    PipesModule
  ]
})
export class PowerBiModule {}
