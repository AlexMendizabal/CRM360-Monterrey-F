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
import { ComercialCadastrosSetorAtividadeModuleRoutingModule } from './setor-atividade-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosSetorAtividadeListaComponent } from './lista/lista.component';
import { ComercialCadastrosSetorAtividadeFormularioComponent } from './formulario/formulario.component';

@NgModule({
  declarations: [
    ComercialCadastrosSetorAtividadeListaComponent,
    ComercialCadastrosSetorAtividadeFormularioComponent,
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
    ComercialCadastrosSetorAtividadeModuleRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService],
})
export class ComercialCadastrosSetorAtividadeModule {}
