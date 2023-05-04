import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { ComercialRelatoriosRoutingModule } from './relatorios-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialRelatoriosComponent } from './relatorios.component';

@NgModule({
  declarations: [ComercialRelatoriosComponent],
  imports: [
    CommonModule,
    ComercialRelatoriosRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class ComercialRelatoriosModule {}
