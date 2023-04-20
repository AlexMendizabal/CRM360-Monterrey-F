import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

// Modules
import { ComercialRoutingModule } from './comercial-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

// Components
import { ComercialComponent } from './comercial.component';

@NgModule({
  declarations: [ComercialComponent],
  imports: [
    CommonModule,
    ComercialRoutingModule,
    ModuleWrapperModule,
    NotFoundModule
  ]
})
export class ComercialModule {}
