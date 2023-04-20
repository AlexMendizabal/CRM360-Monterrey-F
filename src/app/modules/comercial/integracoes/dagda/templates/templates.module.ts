import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialIntegracaoDagdaMateriaisTemplatesMaterialPrincipalComponent } from './material-principal/material-principal.component';

// Components

@NgModule({
  declarations: [
    ComercialIntegracaoDagdaMateriaisTemplatesMaterialPrincipalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    TemplatesModule,
  ],
  exports: [
    ComercialIntegracaoDagdaMateriaisTemplatesMaterialPrincipalComponent,
  ],
})
export class ComercialIntegracoesDagdaMateriaisTemplatesModule {}
