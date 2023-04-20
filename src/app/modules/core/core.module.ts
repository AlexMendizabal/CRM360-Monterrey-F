import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { CoreRoutingModule } from './core-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { CoreComponent } from './core.component';
import { CoreHomeComponent } from './home/home.component';

@NgModule({
  declarations: [CoreComponent, CoreHomeComponent],
  imports: [
    CommonModule,
    CoreRoutingModule,
    ModuleWrapperModule,
    TemplatesModule
  ]
})
export class CoreModule {}
