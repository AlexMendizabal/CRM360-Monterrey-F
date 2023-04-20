import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// ng-brazil
import { NgBrazil } from 'ng-brazil';

import { ServicosContatosRoutingModule } from './contatos-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { ServicosContatosListaComponent } from './lista/lista.component';

@NgModule({
  declarations: [ServicosContatosListaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    NgBrazil,
    ServicosContatosRoutingModule,
    NotFoundModule,
    TemplatesModule,
    SharedModule
  ]
})
export class ServicosContatosModule { }
