import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

// Modules
import { TecnologiaInformacaoRoutingModule } from './tecnologia-informacao-routing.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

// Components
import { TecnologiaInformacaoComponent } from './tecnologia-informacao.component';

@NgModule({
  declarations: [TecnologiaInformacaoComponent],
  imports: [
    CommonModule,
    TecnologiaInformacaoRoutingModule,
    ModuleWrapperModule,
    NotFoundModule
  ]
})
export class TecnologiaInformacaoModule {}
