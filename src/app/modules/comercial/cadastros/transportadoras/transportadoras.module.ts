import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosTransportadoraRoutingModule } from './transportadoras-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosTransportadoraListaComponent } from './lista/lista.component';
import { ComercialCadastrosTransportadoraFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialCadastrosTransportadoraListaComponent,
    ComercialCadastrosTransportadoraFormularioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    ComercialCadastrosTransportadoraRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class ComercialCadastrosTransportadoraModule {}
