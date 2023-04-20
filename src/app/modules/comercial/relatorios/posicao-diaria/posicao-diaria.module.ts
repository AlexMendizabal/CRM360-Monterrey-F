import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Modules
import { ComercialRelatoriosPosicaoDiariaRoutingModule } from './posicao-diaria-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialRelatoriosPosicaoDiariaComponent } from './posicao-diaria.component';

@NgModule({
  declarations: [ComercialRelatoriosPosicaoDiariaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    CurrencyMaskModule,
    ComercialRelatoriosPosicaoDiariaRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class ComercialRelatoriosPosicaoDiariaModule {}
