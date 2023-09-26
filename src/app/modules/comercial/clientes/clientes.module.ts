import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Counto
import { CountoModule } from 'angular2-counto';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialClientesRoutingModule } from './clientes-routing.module';

// Components
import { ComercialClientesListaComponent } from './lista/lista.component';
import { ComercialClientesPreCadastroComponent } from './pre-cadastro/pre-cadastro.component';
import { ComercialClientesDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialClientesDashboardModule } from './dashboard/dashboard.module';
import { ComercialClientesHistoricoFinanceiroModule } from './historico-financeiro/historico-financeiro.module';
import { ComercialClientesPropostaAnaliseCreditoComponent } from './proposta-analise-credito/proposta-analise-credito.component';
import { ComercialClientesUltimosPrecosComponent } from './ultimos-precos/ultimos-precos.component';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    ComercialClientesListaComponent,
    ComercialClientesPreCadastroComponent,
    ComercialClientesDetalhesComponent,
    ComercialClientesPropostaAnaliseCreditoComponent,
    ComercialClientesUltimosPrecosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CountoModule,
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    CurrencyMaskModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialClientesRoutingModule,
    ComercialClientesDashboardModule,
    ComercialClientesHistoricoFinanceiroModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc' // Reemplaza con tu propia clave de API de Google Maps
    }),
    
  ]
})
export class ComercialClientesModule {}
