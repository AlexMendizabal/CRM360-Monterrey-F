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
import { ComercialIntegracoesArcelorMittalVendedoresRoutingModule } from './vendedores-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialIntegracoesArcelorMittalVendedoresListaComponent } from './lista/lista.component';
import { ComercialIntegracoesArcelorMittalVendedoresFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialIntegracoesArcelorMittalVendedoresService } from './vendedores.service';

@NgModule({
  declarations: [
    ComercialIntegracoesArcelorMittalVendedoresListaComponent,
    ComercialIntegracoesArcelorMittalVendedoresFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialIntegracoesArcelorMittalVendedoresRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [
    PNotifyService,
    ComercialIntegracoesArcelorMittalVendedoresService,
  ],
})
export class ComercialIntegracoesArcelorMittalVendedoresModule {}
