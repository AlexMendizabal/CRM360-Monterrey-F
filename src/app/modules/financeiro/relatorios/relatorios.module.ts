import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { FinanceiroRelatoriosRoutingModule } from './relatorios-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { FinanceiroRelatoriosComponent } from './relatorios.component';

@NgModule({
  declarations: [FinanceiroRelatoriosComponent],
  imports: [
    CommonModule,
    FinanceiroRelatoriosRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
})
export class FinanceiroRelatoriosModule {}
