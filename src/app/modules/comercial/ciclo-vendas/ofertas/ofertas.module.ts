import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
// ng-select
import { NgSelectModule } from '@ng-select/ng-select';
// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';
// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Routing Module
import { OfertasRoutingModule } from './ofertas-routing.module';
//component
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioModule } from './formulario/formulario.module';

// Services
import { OfertasService } from './ofertas.service'
import { ListaComponent } from './lista/lista.component';
import { ListaModule } from './lista/lista.module';

@NgModule({
  declarations: [FormularioComponent, ListaComponent],
  imports: [
    CommonModule,
    OfertasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    SharedModule,
    TemplatesModule,
    FormularioModule,
    ListaModule
  ],
  providers: [
    PNotifyService,
    OfertasService
  ]
})

export class OfertasModule { }
