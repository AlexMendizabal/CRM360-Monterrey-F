import { ComercialCicloVendasCotacoesFormularioService } from './formulario.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// angular2-counto
import { CountoModule } from 'angular2-counto';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialTemplatesModule } from '../../../templates/templates.module';

// Components
import { ComercialCicloVendasCotacoesFormularioComponent } from './formulario.component';
import { ComercialCicloVendasCotacoesFormularioMateriaisListaComponent } from './materiais/lista/lista.component';
import { ComercialCicloVendasCotacoesFormularioCarrinhoComponent } from './carrinho/carrinho.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralComponent } from './modal/material/ficha-cadastral/ficha-cadastral.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent } from './modal/material/similaridade/similaridade.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent } from './modal/material/calculo/calculo.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent } from './modal/material/lote/lote.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent } from './modal/material/desconto/desconto.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent } from './modal/material/estoque/estoque.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent } from './modal/material/combo/combo.component';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent } from './modal/cliente/historico-compras/historico-compras.component';
import { ComercialCicloVendasCotacoesFormularioMateriaisRelacionadosComponent } from './materiais/relacionados/relacionados.component';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent } from './modal/detalhes/cliente/cliente.component';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent } from './modal/detalhes/endereco/endereco.component';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesContatoComponent } from './modal/detalhes/contato/contato.component';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent } from './modal/detalhes/concorrente/concorrente.component';
import { ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent } from './modal/duplicatas/duplicatas.component';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent } from './modal/historico-exclusao/historico-exclusao.component';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent } from './modal/finalizacao/padrao/padrao.component';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent } from './modal/finalizacao/perdida/perdida.component';
import { ComercialCicloVendasCotacoesFormularioTemplateCardMaterialComponent } from './templates/card-material/card-material.component';
import { ComercialCicloVendasCotacoesFormularioTemplateClientesComponent } from './templates/clientes/clientes.component';
import { ComercialCicloVendasCotacoesFormularioTemplateButtonDisponibilidadeComponent } from './templates/button-disponibilidade/button-disponibilidade.component';
import { ComercialCicloVendasCotacoesFormularioTemplateButtonOutrosComponent } from './templates/button-outros/button-outros.component';
import { ComercialCicloVendasCotacoesFormularioTemplateProgressBarComponent } from './templates/progress-bar/progress-bar.component';

// Services
import { ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService } from './modal/material/ficha-cadastral/ficha-cadastral.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService } from './modal/material/similaridade/similaridade.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService } from './modal/material/calculo/calculo.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialLoteService } from './modal/material/lote/lote.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService } from './modal/material/desconto/desconto.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService } from './modal/material/estoque/estoque.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboService } from './modal/material/combo/combo.service';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService } from './modal/cliente/historico-compras/historico-compras.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService } from './modal/detalhes/cliente/cliente.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService } from './modal/detalhes/endereco/endereco.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesContatoService } from './modal/detalhes/contato/contato.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService } from './modal/detalhes/concorrente/concorrente.service';
import { ComercialCicloVendasCotacoesFormularioModalDuplicatasService } from './modal/duplicatas/duplicatas.service';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoService } from './modal/historico-exclusao/historico-exclusao.service';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoService } from './modal/finalizacao/finalizacao.service';
import { ComercialCicloVendasCotacoesFormularioModalSelecionarComponent } from './modal/cliente/selecionar/selecionar.component';
import { ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionComponent } from './modal/material/ubicacion/ubicacion.component';
import { AgmCoreModule } from '@agm/core';



@NgModule({
  declarations: [
    ComercialCicloVendasCotacoesFormularioComponent,
    ComercialCicloVendasCotacoesFormularioMateriaisListaComponent,
    ComercialCicloVendasCotacoesFormularioCarrinhoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent,
    ComercialCicloVendasCotacoesFormularioMateriaisRelacionadosComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent,
    ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent,
    ComercialCicloVendasCotacoesFormularioTemplateCardMaterialComponent,
    ComercialCicloVendasCotacoesFormularioTemplateClientesComponent,
    ComercialCicloVendasCotacoesFormularioTemplateButtonDisponibilidadeComponent,
    ComercialCicloVendasCotacoesFormularioTemplateButtonOutrosComponent,
    ComercialCicloVendasCotacoesFormularioTemplateProgressBarComponent,
    ComercialCicloVendasCotacoesFormularioModalSelecionarComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PopoverModule.forRoot(),
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    CarouselModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    TextMaskModule,
    NgBrazil,
    CountoModule,
    ReactiveFormsModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc' // Reemplaza con tu propia clave de API de Google Maps
    }),
  ],
  exports: [
    ComercialCicloVendasCotacoesFormularioComponent,
    ComercialCicloVendasCotacoesFormularioMateriaisListaComponent,
    ComercialCicloVendasCotacoesFormularioCarrinhoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent,
    ComercialCicloVendasCotacoesFormularioMateriaisRelacionadosComponent,
    ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent,
    ComercialCicloVendasCotacoesFormularioTemplateCardMaterialComponent,
    ComercialCicloVendasCotacoesFormularioTemplateClientesComponent,
    ComercialCicloVendasCotacoesFormularioTemplateButtonDisponibilidadeComponent,
    ComercialCicloVendasCotacoesFormularioTemplateButtonOutrosComponent,
    ComercialCicloVendasCotacoesFormularioTemplateProgressBarComponent,
    ComercialCicloVendasCotacoesFormularioModalSelecionarComponent,
  ],
  entryComponents: [
    ComercialCicloVendasCotacoesFormularioModalSelecionarComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent,
    ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent,
    ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent,
    ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent,
  ],
  providers: [
    BsModalRef,
    ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService,
    ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService,
    ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService,
    ComercialCicloVendasCotacoesFormularioModalMaterialLoteService,
    ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService,
    ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService,
    ComercialCicloVendasCotacoesFormularioModalMaterialComboService,
    ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService,
    ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService,
    ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService,
    ComercialCicloVendasCotacoesFormularioModalDetalhesContatoService,
    ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService,
    ComercialCicloVendasCotacoesFormularioModalDuplicatasService,
    ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoService,
    ComercialCicloVendasCotacoesFormularioModalFinalizacaoService,
    ComercialCicloVendasCotacoesFormularioService,
  ],
})
export class ComercialCicloVendasCotacoesFormularioModule {}
