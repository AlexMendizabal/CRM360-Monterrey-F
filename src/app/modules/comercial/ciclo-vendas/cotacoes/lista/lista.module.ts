
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrencyMaskModule } from 'ng2-currency-mask';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialClientesDashboardModule } from '../../../clientes/dashboard/dashboard.module';
import { ComercialCicloVendasCotacoesFormularioModule } from '../formulario/formulario.module';

// Components
import { ComercialCicloVendasCotacoesListaComponent } from './lista.component';
import { ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent } from './modal/historico-comercial/historico-comercial.component';
import { ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent } from './modal/consulta-liberacao/consulta-liberacao.component';
import { ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent } from './modal/email-cotacao/email-cotacao.component';
import { ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent } from './modal/trocar-empresa/trocar-empresa.component';
import { ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent } from './modal/duplicar-proposta/duplicar-proposta.component';
import { ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent } from './modal/desdobrar-proposta/desdobrar-proposta.component';
import { ComercialCicloVendasCotacoesListaModalTrocarClienteComponent } from './modal/trocar-cliente/trocar-cliente.component';
import { ComercialCicloVendasCotacoesListaModalTransfereFaturamentoComponent } from './modal/transfere-faturamento/transfere-faturamento.component';
import { ComercialCicloVendasCotacoesListaTemplatesButtonImprimirComponent } from './templates/button-imprimir/button-imprimir.component';
import { ComercialCicloVendasCotacoesListaTemplatesButtonImprimirSeparacaoComponent } from './templates/button-imprimir-separacao/button-imprimir-separacao.component';
import { ComercialCicloVendasCotacoesListaModalHistoricoExclusaoComponent } from './modal/historico-exclusao/historico-exclusao.component';
import { PdfComponent } from './pdf/pdf.component';

// Services
import { ComercialCicloVendasCotacoesListaModalHistoricoComercialService } from './modal/historico-comercial/historico-comercial.service';
import { ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService } from './modal/consulta-liberacao/consulta-liberacao.service';
import { ComercialCicloVendasCotacoesListaModalEmailCotacaoService } from './modal/email-cotacao/email-cotacao.service';
import { ComercialCicloVendasCotacoesListaModalTrocarEmpresaService } from './modal/trocar-empresa/trocar-empresa.service';
import { ComercialCicloVendasCotacoesListaModalDuplicarPropostaService } from './modal/duplicar-proposta/duplicar-proposta.service';
import { ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService } from './modal/desdobrar-proposta/desdobrar-proposta.service';
import { ComercialCicloVendasCotacoesListaModalTrocarClienteService } from './modal/trocar-cliente/trocar-cliente.service';
import { ComercialCicloVendasCotacoesListaModalTransfereFaturamentoService } from './modal/transfere-faturamento/transfere-faturamento.service';
import { ComercialCicloVendasCotacoesListaModalHistoricoExclusaoService } from './modal/historico-exclusao/historico-exclusao.service';
import { ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent } from './modal/alerta-oferta/alerta-oferta.component';

import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { VistaComponent } from './vista/vista.component';


@NgModule({
  declarations: [
    PdfComponent,
    ComercialCicloVendasCotacoesListaComponent,
    ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent,
    ComercialCicloVendasCotacoesListaModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent,
    ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent,
    ComercialCicloVendasCotacoesListaTemplatesButtonImprimirComponent,
    ComercialCicloVendasCotacoesListaTemplatesButtonImprimirSeparacaoComponent,
    ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent,
    ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalTrocarClienteComponent,
    ComercialCicloVendasCotacoesListaModalTransfereFaturamentoComponent,
    VistaComponent,
    ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgBrazil,
    TextMaskModule,
    CurrencyMaskModule,
    NgSelectModule,
    SharedModule,
    TemplatesModule,
    ComercialClientesDashboardModule,
    ComercialCicloVendasCotacoesFormularioModule

    ],
  exports: [
    ComercialCicloVendasCotacoesListaComponent,
    ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent,
    ComercialCicloVendasCotacoesListaModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent,
    ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent,
    ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent,
    ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalTrocarClienteComponent,
    ComercialCicloVendasCotacoesListaModalTransfereFaturamentoComponent,
    ComercialCicloVendasCotacoesListaTemplatesButtonImprimirComponent,
    ComercialCicloVendasCotacoesListaTemplatesButtonImprimirSeparacaoComponent,
    ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent


  ],
  entryComponents: [
    ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent,
    ComercialCicloVendasCotacoesListaModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent,
    ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent,
    ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent,
    ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent,
    ComercialCicloVendasCotacoesListaModalTrocarClienteComponent,
    ComercialCicloVendasCotacoesListaModalTransfereFaturamentoComponent,
    ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent,

  ],
  providers: [
    ComercialCicloVendasCotacoesListaModalHistoricoComercialService,
    ComercialCicloVendasCotacoesListaModalHistoricoExclusaoService,
    ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService,
    ComercialCicloVendasCotacoesListaModalEmailCotacaoService,
    ComercialCicloVendasCotacoesListaModalTrocarEmpresaService,
    ComercialCicloVendasCotacoesListaModalDuplicarPropostaService,
    ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService,
    ComercialCicloVendasCotacoesListaModalTrocarClienteService,
    ComercialCicloVendasCotacoesListaModalTransfereFaturamentoService
    

  ],
})
export class ComercialCicloVendasCotacoesListaModule {}
