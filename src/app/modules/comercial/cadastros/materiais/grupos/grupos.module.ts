import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosMateriaisGrupoRoutingModule } from './grupos-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosMateriaisGrupoListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisGrupoFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosMateriaisGrupoService } from './grupos.service';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisGrupoListaComponent,
    ComercialCadastrosMateriaisGrupoFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosMateriaisGrupoRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService, ComercialCadastrosMateriaisGrupoService],
})
export class ComercialCadastrosMateriaisGrupoModule {}
