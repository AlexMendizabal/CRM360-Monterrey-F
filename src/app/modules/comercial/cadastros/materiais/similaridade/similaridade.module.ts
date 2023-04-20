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
import { ComercialCadastrosMateriaisSimilaridadeRoutingModule } from './similaridade-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialCadastrosMateriaisSimilaridadeListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisSimilaridadeFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosMateriaisSimilaridadeService } from './similaridade.service';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisSimilaridadeListaComponent,
    ComercialCadastrosMateriaisSimilaridadeFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosMateriaisSimilaridadeRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
  ],
  providers: [PNotifyService, ComercialCadastrosMateriaisSimilaridadeService],
})
export class ComercialCadastrosMateriaisSimilaridadeModule {}
