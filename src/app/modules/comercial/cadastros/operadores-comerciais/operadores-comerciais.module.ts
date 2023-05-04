import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosOperadorComercialModuleRoutingModule } from './operadores-comerciais-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosOperadorComercialListaComponent } from './lista/lista.component';
import { ComercialCadastrosOperadorComercialFormularioComponent } from './formulario/formulario.component';
import { ComercialCadastrosOperadorComercialAssociacoesComponent } from './associacoes/associacoes.component';

@NgModule({
  declarations: [
    ComercialCadastrosOperadorComercialListaComponent,
    ComercialCadastrosOperadorComercialFormularioComponent,
    ComercialCadastrosOperadorComercialAssociacoesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    ComercialCadastrosOperadorComercialModuleRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class ComercialCadastrosOperadorComercialModule {}
