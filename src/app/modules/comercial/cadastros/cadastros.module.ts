import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { ComercialCadastrosRoutingModule } from './cadastros-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosComponent } from './cadastros.component';

@NgModule({
  declarations: [ComercialCadastrosComponent],
  imports: [
    CommonModule,
    ComercialCadastrosRoutingModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule
  ]
})
export class ComercialCadastrosModule {}
