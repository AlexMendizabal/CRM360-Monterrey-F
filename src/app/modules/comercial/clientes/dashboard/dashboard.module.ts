import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Counto
import { CountoModule } from 'angular2-counto';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialClientesDashboardComponent } from './dashboard.component';
import { ComercialClientesDashboardFinanceiroComponent } from './financeiro/financeiro.component';
import { ComercialClientesDashboardComercialComponent } from './comercial/comercial.component';
import { ComercialClientesDashboardComercialUltimosPrecosComponent } from './comercial/ultimos-precos/ultimos-precos.component';
import { ComercialClientesDashboardRegistroOcorrenciasComponent } from './registro-ocorrencias/registro-ocorrencias.component';
import { ComercialClientesDashboardPropostasGraficoComponent } from './propostas/grafico/grafico.component';
import { ComercialClientesDashboardPropostasAnaliticoComponent } from './propostas/analitico/analitico.component';
import { ComercialClientesDashboardFaturamentoGraficoComponent } from './faturamento/grafico/grafico.component';
import { ComercialClientesDashboardFaturamentoMaisCompradosComponent } from './faturamento/mais-comprados/mais-comprados.component';
import { ComercialClientesDashboardFaturamentoLinhaAnaliticoComponent } from './faturamento/linha/analitico/analitico.component';
import { ComercialClientesDashboardFaturamentoLinhaComparativoComponent } from './faturamento/linha/comparativo/comparativo.component';

@NgModule({
  declarations: [
    ComercialClientesDashboardComponent,
    ComercialClientesDashboardFinanceiroComponent,
    ComercialClientesDashboardComercialComponent,
    ComercialClientesDashboardComercialUltimosPrecosComponent,
    ComercialClientesDashboardRegistroOcorrenciasComponent,
    ComercialClientesDashboardPropostasGraficoComponent,
    ComercialClientesDashboardPropostasAnaliticoComponent,
    ComercialClientesDashboardFaturamentoGraficoComponent,
    ComercialClientesDashboardFaturamentoMaisCompradosComponent,
    ComercialClientesDashboardFaturamentoLinhaAnaliticoComponent,
    ComercialClientesDashboardFaturamentoLinhaComparativoComponent
  ],
  imports: [
    CommonModule,
    TooltipModule,
    CountoModule,
    SharedModule,
    TemplatesModule.forRoot()
  ],
  exports: [ComercialClientesDashboardComercialUltimosPrecosComponent]
})
export class ComercialClientesDashboardModule {}
