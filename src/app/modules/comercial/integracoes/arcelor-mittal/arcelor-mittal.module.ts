import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialIntegracoesArcelorMittalRoutingModule } from './arcelor-mittal-routing.module';

// Components
import { ComercialIntegracoesArcelorMittalComponent } from './arcelor-mittal.component';
import { ComercialIntegracoesArcelorMittalClassesMateriaisComponent } from './classes-materiais/classes-materiais.component';
import { ComercialIntegracoesArcelorMittalClassesMateriaisFormularioComponent } from './classes-materiais/formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialIntegracoesArcelorMittalComponent,
    ComercialIntegracoesArcelorMittalClassesMateriaisComponent,
    ComercialIntegracoesArcelorMittalClassesMateriaisFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    NotFoundModule,
    SharedModule.forRoot(),
    PipesModule.forRoot(),
    TemplatesModule.forRoot(),
    ComercialIntegracoesArcelorMittalRoutingModule,
  ],
})
export class ComercialIntegracoesArcelorMittalModule {}
