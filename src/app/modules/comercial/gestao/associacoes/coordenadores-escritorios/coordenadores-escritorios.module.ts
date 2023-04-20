import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialGestaoAssociacioesCoordenadoresEscritoriosRoutingModule } from './coordenadores-escritorios-routing.module';

// Components
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialGestaoAssociacoesCoordenadoresEscritoriosFormularioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TemplatesModule,
    ComercialGestaoAssociacioesCoordenadoresEscritoriosRoutingModule
  ]
})
export class ComercialGestaoAssociacioesCoordenadoresEscritoriosModule {}
