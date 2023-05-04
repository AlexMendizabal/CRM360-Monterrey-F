import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosMateriaisFichaCadastralModuleRoutingModule } from './ficha-cadastral-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialCadastrosMateriaisFichaCadastralListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisFichaCadastralFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisFichaCadastralListaComponent,
    ComercialCadastrosMateriaisFichaCadastralFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    ComercialCadastrosMateriaisFichaCadastralModuleRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
  ],
  providers: [PNotifyService],
})
export class ComercialCadastrosMateriaisFichaCadastralModule {}
