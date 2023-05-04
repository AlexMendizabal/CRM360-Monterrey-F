import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

//numeros, datas com padrão brasileiro
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)

// Counto
import { CountoModule } from 'angular2-counto';

import { SharedModule } from 'src/app/shared/modules/shared.module';

import { CorteDobraDashboardComponent } from './dashboard.component';
import { CorteDobraDashboardAnaliticoComponent } from './analitico/analitico.component';
import { CorteDobraDashboardEntradaPedidosComponent } from './entrada-pedidos/entrada-pedidos.component';
import { CorteDobraDashboardFaturamentoComponent } from './faturamento/faturamento.component';
import { CorteDobraDashboardFiltroComponent } from './filtro/filtro.component';
import { CorteDobraDashboardPedidosComponent } from './pedidos/pedidos.component';
import { CorteDobraDashboardPlanilhadoComponent } from './planilhado/planilhado.component';
import { CorteDobraDashboardProducaoComponent } from './producao/producao.component';
import { CorteDobraDashboardRegistroOcorrenciaComponent } from './registro-ocorrencia/registro-ocorrencia.component';
import { CorteDobraDashboardTransporteComponent } from './transporte/transporte.component';

@NgModule({
  declarations: [
    CorteDobraDashboardComponent,
    CorteDobraDashboardFiltroComponent,
    CorteDobraDashboardAnaliticoComponent,
    CorteDobraDashboardRegistroOcorrenciaComponent,
    CorteDobraDashboardTransporteComponent,
    CorteDobraDashboardEntradaPedidosComponent,
    CorteDobraDashboardPedidosComponent,
    CorteDobraDashboardFaturamentoComponent,
    CorteDobraDashboardProducaoComponent,
    CorteDobraDashboardPlanilhadoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    CountoModule,
    SharedModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class CorteDobraDashboardModule {}
