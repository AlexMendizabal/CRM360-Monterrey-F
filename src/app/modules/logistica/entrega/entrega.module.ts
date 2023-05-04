import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SortableModule, ProgressbarModule } from 'ngx-bootstrap';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';

import { LogisticaEntregaRoutingModule } from './entrega-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';

import { LogisticaEntregaComponent } from './entrega.component';
/* import { LogisticaEntregaAssociacaoRestricoesListaComponent } from './associacao-de-restricoes/lista/lista.component';
import { LogisticaEntregaRestricoesCadastroComponent } from './restricoes/cadastro/cadastro.component';
import { LogisticaEntregaRestricoesListaComponent } from './restricoes/lista/lista.component';
import { LogisticaEntregaPrazoComponent } from './prazo/prazo.component';
import { LogisticaEntregaPedidosListaComponent } from './pedidos/lista/lista.component';
import { LogisticaEntregaPedidosCadastroComponent } from './pedidos/cadastro/cadastro.component';
import { LogisticaEntregaFormacaoCargaListaComponent } from './formacao-cargas/lista/lista.component';
import { LogisticaEntregaFormacaoCargaCadastroComponent } from './formacao-cargas/cadastro/cadastro.component'; */
/* import { LogisticaEntregaMonitorIntegracaoSteelLogComponent } from './monitores/steellog/steellog.component';
import { LogisticaEngregasMonitoresFusionPedidosComponent } from './monitores/fusion/pedidos.component';
import { LogisticaEntregaMonitorIntegracaoRavexComponent } from './monitores/ravex/ravex.component'; */


@NgModule({
  declarations: [
    LogisticaEntregaComponent
    /* LogisticaEntregaAssociacaoRestricoesListaComponent,
    LogisticaEntregaRestricoesListaComponent,
    LogisticaEntregaRestricoesCadastroComponent,
    LogisticaEntregaPrazoComponent,
    LogisticaEntregaPedidosListaComponent,
    LogisticaEntregaPedidosCadastroComponent,
    LogisticaEntregaFormacaoCargaListaComponent,
    LogisticaEntregaFormacaoCargaCadastroComponent, */
    /* LogisticaEntregaMonitorIntegracaoSteelLogComponent,
    LogisticaEngregasMonitoresFusionPedidosComponent,
    LogisticaEntregaMonitorIntegracaoRavexComponent */
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    LogisticaEntregaRoutingModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    SortableModule.forRoot(),
    ModalModule.forRoot(),
    NotFoundModule,
    PipesModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgBrazil,
    TextMaskModule,
    CurrencyMaskModule
  ]
})
export class LogisticaEntregaModule { }
