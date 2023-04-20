import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FiscalRelatoriosRoutingModule } from './relatorios-routing.module';

import { FiscalRelatoriosComponent } from './relatorios.component';

@NgModule({
  declarations: [FiscalRelatoriosComponent],
  imports: [CommonModule, FiscalRelatoriosRoutingModule]
})
export class FiscalRelatoriosModule {}
