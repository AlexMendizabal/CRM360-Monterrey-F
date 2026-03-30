import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotasFiscaisSuprimentosRoutingModule } from './notas-fiscais-suprimentos-routing.module';
import { FiscalRelatoriosNotasFiscaisSuprimentosComponent } from './notas-fiscais-suprimentos.component';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  declarations: [FiscalRelatoriosNotasFiscaisSuprimentosComponent],
  imports: [
    CommonModule,
    NotasFiscaisSuprimentosRoutingModule,
    TemplatesModule.forRoot(),
    FormsModule,
    NgSelectModule,
    SharedModule,
    NotFoundModule,
    PipesModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot()
  ]
})
export class NotasFiscaisSuprimentosModule {}
