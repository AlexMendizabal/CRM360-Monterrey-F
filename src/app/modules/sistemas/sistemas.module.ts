import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { SistemasRoutingModule } from './sistemas-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

// Components
import { SistemasComponent } from './sistemas.component';
import { SistemasHomeComponent } from './home/home.component';
import { SistemasRenderizadorComponent } from './renderizador/renderizador.component';

@NgModule({
  declarations: [
    SistemasComponent,
    SistemasHomeComponent,
    SistemasRenderizadorComponent
  ],
  imports: [
    CommonModule,
    SistemasRoutingModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NotFoundModule
  ]
})
export class SistemasModule {}
