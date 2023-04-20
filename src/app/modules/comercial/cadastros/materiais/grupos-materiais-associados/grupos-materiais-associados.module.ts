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
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosRoutingModule } from './grupos-materiais-associados-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosService } from './grupos-materiais-associados.service';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisGrupoMateriaisAssociadosListaComponent,
    ComercialCadastrosMateriaisGrupoMateriaisAssociadosFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosMateriaisGrupoMateriaisAssociadosRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [PNotifyService, ComercialCadastrosMateriaisGrupoMateriaisAssociadosService],
})
export class ComercialCadastrosMateriaisGrupoMateriaisAssociadosModule {}
