import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosMateriaisCrossSellRoutingModule } from './cross-sell-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialCadastrosMateriaisCrossSellListaComponent } from './lista/lista.component';
import { ComercialCadastrosMateriaisCrossSellFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosMateriaisCrossSellService } from './cross-sell.service';

@NgModule({
  declarations: [
    ComercialCadastrosMateriaisCrossSellListaComponent,
    ComercialCadastrosMateriaisCrossSellFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TooltipModule,
    TabsModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosMateriaisCrossSellRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
  ],
  providers: [PNotifyService, ComercialCadastrosMateriaisCrossSellService],
})
export class ComercialCadastrosMateriaisCrossSellModule {}
