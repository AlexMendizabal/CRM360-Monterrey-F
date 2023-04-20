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
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisRoutingModule } from './situacoes-contratos-comerciais-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisListaComponent } from './lista/lista.component';
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisListaComponent,
    ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioComponent,
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
    ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService],
})
export class ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisModule {}
