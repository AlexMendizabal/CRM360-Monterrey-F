import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// Counto
import { CountoModule } from 'angular2-counto';

// Modules
import { ComercialDashboardVendedorRoutingModule } from './vendedor-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialTemplatesModule } from '../../templates/templates.module';

// Components
import { ComercialDashboardVendedorComponent } from './vendedor.component';
import { ComercialDashboardVendedorDesempenhoToneladasComponent } from './desempenho/toneladas/toneladas.component';
import { ComercialDashboardVendedorDesempenhoLinhaComponent } from './desempenho/linha/linha.component';
import { ComercialDashboardVendedorConcentracaoVendasComponent } from './concentracao-vendas/concentracao-vendas.component';
import { ComercialDashboardVendedorClientesComponent } from './clientes/clientes.component';
import { ComercialDashboardVendedorRegistroOcorrenciasComponent } from './registro-ocorrencias/registro-ocorrencias.component';
import { ComercialDashboardVendedorFinanceiroComponent } from './financeiro/financeiro.component';
import { ComercialDashboardVendedorAnaliticoComponent } from './analitico/analitico.component';
import { ComercialDashboardVendedorRepresentanteComponent } from './representante/representante.component';

@NgModule({
  declarations: [
    ComercialDashboardVendedorComponent,
    ComercialDashboardVendedorDesempenhoToneladasComponent,
    ComercialDashboardVendedorDesempenhoLinhaComponent,
    ComercialDashboardVendedorConcentracaoVendasComponent,
    ComercialDashboardVendedorClientesComponent,
    ComercialDashboardVendedorRegistroOcorrenciasComponent,
    ComercialDashboardVendedorFinanceiroComponent,
    ComercialDashboardVendedorAnaliticoComponent,
    ComercialDashboardVendedorRepresentanteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    CountoModule,
    ComercialDashboardVendedorRoutingModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialTemplatesModule
  ]
})
export class ComercialDashboardVendedorModule {}
