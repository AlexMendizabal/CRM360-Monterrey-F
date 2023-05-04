import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosMateriaisTemplatesMaterialPrincipalComponent } from './material-principal/material-principal.component';
import { ComercialCadastrosMateriaisTemplatesAssociacoesComponent } from './associacoes/associacoes.component';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisTemplatesMaterialPrincipalComponent,
    ComercialCadastrosMateriaisTemplatesAssociacoesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    TemplatesModule,
  ],
  exports: [
    ComercialCadastrosMateriaisTemplatesMaterialPrincipalComponent,
    ComercialCadastrosMateriaisTemplatesAssociacoesComponent,
  ],
})
export class ComercialCadastrosMateriaisTemplatesModule {}
