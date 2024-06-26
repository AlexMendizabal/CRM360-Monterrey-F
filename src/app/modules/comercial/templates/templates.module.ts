import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';

// Components
import { ComercialTemplatesFiltroVendedorEscritorioComponent } from './filtro-vendedor-escritorio/filtro-vendedor-escritorio.component';
import { ComercialTemplatesMapaMetasComponent } from './mapa-metas/mapa-metas.component';
import{ ComercialTemplatesFiltroVendedorEscritorioDateComponent} from './filtro-vendedor-escritorio-date/filtro-vendedor-escritorio-date.component';

@NgModule({
  declarations: [
    ComercialTemplatesFiltroVendedorEscritorioComponent,
    ComercialTemplatesFiltroVendedorEscritorioDateComponent,
    ComercialTemplatesMapaMetasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    SharedModule
  ],
  exports: [
    ComercialTemplatesFiltroVendedorEscritorioComponent,
    ComercialTemplatesFiltroVendedorEscritorioDateComponent,
    ComercialTemplatesMapaMetasComponent
  ]
})
export class ComercialTemplatesModule {}
