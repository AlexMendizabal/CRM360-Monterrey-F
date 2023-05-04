import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

// Componentes
import { TidSoftwareComponent } from './tid-software.component';
import { TidSoftwareHomeComponent } from './home/home.component';
import { TidSoftwareRoutingModule } from './tid-software-routing.module';
import { TidSoftwareEmpresasComponent } from './empresas/empresas.component';

@NgModule({
  declarations: [
    TidSoftwareComponent,
    TidSoftwareHomeComponent,
    TidSoftwareEmpresasComponent
  ],
  imports: [
    CommonModule,
    TidSoftwareRoutingModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    PipesModule
  ]
})
export class TidSoftwareModule {}
